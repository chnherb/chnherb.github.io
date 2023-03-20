---
categories: ["db"]
tags: ["LevelDB"]
title: "LevelDB-04数据读写"
# linkTitle: ""
weight: 10
description: >

---

# 数据写入

## 基本原理

### 新增记录

一个插入操作 Put(key, value) 包含两个具体步骤：

1. 追加写入 log
>以顺序写的方式追加到 log 文件末尾。磁盘顺序写的方式效率很高，不会导致写入速度的急剧降低。

2. 写入 memtable
>如果写入 log 文件成功，那么记录也会插入内存的 Memtable 中，Memtable 是一个 key 有序的跳表。

正是因为一个插入操作涉及一次磁盘文件追加写和内存跳表的插入操作，所以 LevelDB 写入速度很高效。

### 删除记录

删除一条记录并不是立即执行删除操作，而是与插入操作相同，只不过插入操作是插入 key:value 值，而删除操作是插入 key:删除标记，等后台 Compaction 时才执行真正的删除操作。

## WriteBatch

WriteBatch 使用批量写来提高性能，支持 put 和 delete。

### 结构

```c++
// include/leveldb/write_batch.h
class LEVELDB_EXPORT WriteBatch {
 public:
  // Store the mapping "key->value" in the database.
  void Put(const Slice& key, const Slice& value);
  // If the database contains a mapping for "key", erase it.  Else do nothing.
  void Delete(const Slice& key);
  // Clear all updates buffered in this batch.
  void Clear();
  // 内存状态信息
  size_t ApproximateSize() const;
  // 多个 WriteBatch 还可以继续合并
  void Append(const WriteBatch& source);
  // Support for iterating over the contents of a batch.
  Status Iterate(Handler* handler) const;
 private:
  //内部工具性质的辅助类
  friend class WriteBatchInternal;
  // 具体数据
  std::string rep_;  // See comment in write_batch.cc for the format of rep_
};
}  // namespace leveldb

// db/write_batch.cc
// WriteBatch header has an 8-byte sequence number followed by a 4-byte count.
static const size_t kHeader = 12;
```

### 写入数据

代码：include/leveldb/write_batch.h；db/write_batch_internal.h

```c++
std::string value;
leveldb::Status s = db->Get(leveldb::ReadOptions(), key1, &value);
if (s.ok()) s = db->Put(leveldb::WriteOptions(), key2, value);
if (s.ok()) s = db->Delete(leveldb::WriteOptions(), key1);
```
调用 db->Put(WriteOptions(),&key,&value); 写入数据。WriteOptions 只有一个变量 sync，默认初始值为 false，因此默认写数据方式是异步。即每次写操作只要将数据写入到内存中就返回，而将数据从内存写到磁盘的方式是异步的。
异步写的效率比同步写高很多，问题是系统故障时可能会导致最近的写入丢失。

```c++
#include "leveldb/write_batch.h"
...
std::string value;
leveldb::Status s = db->Get(leveldb::ReadOptions(), key1, &value);
if (s.ok()) {
  leveldb::WriteBatch batch;
  batch.Delete(key1);
  batch.Put(key2, value);
  s = db->Write(leveldb::WriteOptions(), &batch);
}
```
LevelDB 使用 WriteBatch 替代简单的异步写操作。首先将所有的写操作记录到一个 batch 中，然后执行同步写，这样同步写的开销就被分散到多个写操作中。
## 写操作

### 写接口

```c++
class LEVELDB_EXPORT DB {
 public:
  // Open the database with the specified "name".
  // Stores a pointer to a heap-allocated database in *dbptr and returns
  // OK on success.
  // Stores nullptr in *dbptr and returns a non-OK status on error.
  // Caller should delete *dbptr when it is no longer needed.
  static Status Open(const Options& options, const std::string& name,
                     DB** dbptr);
  DB() = default;
  DB(const DB&) = delete;
  DB& operator=(const DB&) = delete;
  virtual ~DB();
  // Set the database entry for "key" to "value".  Returns OK on success,
  // and a non-OK status on error.
  // Note: consider setting options.sync = true.
  virtual Status Put(const WriteOptions& options, const Slice& key,
                     const Slice& value) = 0;
  virtual Status Delete(const WriteOptions& options, const Slice& key) = 0;
  virtual Status Write(const WriteOptions& options, WriteBatch* updates) = 0;

```
### 写实现

代码：db/db_impl.h

```c++
class DBImpl : public DB {
 public:
  // 更新一条记录
  // leveldb::DBImpl::Put => leveldb::DB::Put => leveldb::DBImpl::Write
  Status Put(const WriteOptions&, const Slice& key,
             const Slice& value) override;
  // 删除一条记录
  // leveldb::DBImpl::Delete => leveldb::DB::Delete => leveldb::DBImpl::Write
  Status Delete(const WriteOptions&, const Slice& key) override;
  // 更新多条记录
  Status Write(const WriteOptions& options, WriteBatch* updates) override;
```
注意调用流程：leveldb::DBImpl::Put => leveldb::DB::Put => leveldb::DBImpl::Write
### DBImpl::Write

代码：db/db_impl.cc

基本流程：

* 构造 Writer
* 将 writebatch 存入到一个 Writer 中，
* 将 Writer 存入 deque 中。（levedb支持多线程，需要加互斥锁保护writers_）
* 每个生产者在向 writers_ 队列中添加任务之后，都会进入一个 while 循环在里面等待。只有当该生产者加入的任务已经被处理或位于队列的头部，线程才会被唤醒。注意线程被唤醒后会继续检查循环条件，满足条件会继续睡眠。
    * 加入的任务被其他任务处理，线程直接退出。
    * 加入的任务排在了队列的头部且未处理，当前线程将消费者进行后续处理。
```c++
// Writer 结构
struct DBImpl::Writer {
  explicit Writer(port::Mutex* mu)
      : batch(nullptr), sync(false), done(false), cv(mu) {}
  Status status;
  WriteBatch* batch;
  bool sync;
  bool done;
  port::CondVar cv;
};
Status DBImpl::Write(const WriteOptions& options, WriteBatch* updates) {
  // 构造 Writer
  Writer w(&mutex_);
  w.batch = updates;
  w.sync = options.sync;
  w.done = false;
  MutexLock l(&mutex_);
  // 将 Writer push 到 deque 中
  writers_.push_back(&w);
  // 构造 Writer 未执行完时(如合并操作，可能会被其它线程执行完成)，
  // 且未到队列头(没有获得调度)时，则等待
  while (!w.done && &w != writers_.front()) {
    w.cv.Wait();
  }
  // 如果Writer任务被其它writer执行完成，则返回。
  if (w.done) {
    return w.status;
  }
  // 真正执行调度
  ...
  // 将处理完的任务从队列中取出，设置状态为 true，然后通知对应的 port::CondVar
  while (true) {
    Writer* ready = writers_.front();
    writers_.pop_front();
    if (ready != &w) {
      ready->status = status;
      ready->done = true;
      ready->cv.Signal();
    }
    if (ready == last_writer) break;
  }
  // 通知队列中的首 Writer
  if (!writers_.empty()) {
    writers_.front()->cv.Signal();
  }
  return status;
}
```

# 数据读取

## 数据读取流程

* Memtable 查找：首先会去查看内存中的 Memtable，如果 Memtable 中包含key及其对应的value，则直接返回；
* Immutable Memtable 查找：接下来会到内存中的 Immutable Memtable 中查找，读到则返回；
* SSTable 查找：SSTable数量较多且分成多个 level。首先从属于 level 0 的文件中查找，如果找到则直接返回，如果没有找到则到下一个 level 的文件中查找，如此循环往复直到找到或查遍所有 level 没有仍然找到返回不存在为止。
## SST

### 数据分布

* level 0下的不同文件可能key的范围有重叠，某个要查询的key有可能多个文件都包含。
>策略是先找出 level 0 中哪些文件包含这个key（manifest文件中记载了level和对应的文件及文件里key的范围信息，内存中保存该映射表），之后按照文件的新鲜程度排序，新的文件排在前面，之后依次查找，读出key对应的value。

* 非level 0下的不同文件之间key是不重叠的，所以只从一个文件就可以找到key对应的value。
### 查询过程

如果命中了 SST，那么查询过程如下：

* 一般先在内存中的 Cache 中查找是否包含这个文件的缓存记录，找到则从缓存中读取；
* 然后打开 SSTable 文件，同时将文件的索引部分加载到内存中存入 Cache（只有索引部分在 Cache中）；
* 根据索引定位到哪个 Block 包含 key，从文件中读出 Block 的内容，然后根据记录逐一比较，找到则返回，没有找到则到下一级别的 SSTable 中查找。
## 读操作

### 读接口

代码：include/leveldb/db.h

```c++
virtual Status Get(const ReadOptions& options, const Slice& key,
                   std::string* value) = 0;
```

### 读实现

代码：db/db_impl.h

```c++
class DBImpl : public DB {
 public:
  // 读取记录
  Status Get(const ReadOptions& options, const Slice& key,
           std::string* value) override;
```

### DBImpl::Get

```c++
Status DBImpl::Get(const ReadOptions& options, const Slice& key,
                   std::string* value) {
  Status s; 
  // 获取互斥锁
  MutexLock l(&mutex_);
  // 获取本地读操作的 Sequence Number
  SequenceNumber snapshot;
  // 如果 ReadOptions 的 snapshot 不为空，则使用这个 Sequence Number
  // 否则，默认使用 LastSequence
  if (options.snapshot != nullptr) {
    snapshot =
        static_cast<const SnapshotImpl*>(options.snapshot)->sequence_number();
  } else {
    snapshot = versions_->LastSequence();
  }
  // MemTable、Immutable Memtable 和 Current Version 增加引用计数，
  // 避免在读取过程中被后台线程 Compaction 时垃圾回收
  MemTable* mem = mem_;
  MemTable* imm = imm_;
  // Version 主要用来维护 SST 文件的版本信息
  Version* current = versions_->current();
  mem->Ref();
  if (imm != nullptr) imm->Ref();
  current->Ref();
  bool have_stat_update = false;
  Version::GetStats stats;
  // Unlock while reading from files and memtables
  {
    mutex_.Unlock();
    // First look in the memtable, then in the immutable memtable (if any).
    LookupKey lkey(key, snapshot);
    // 查找过程：
    // 1、从 MemTable 查找
    if (mem->Get(lkey, value, &s)) {
      // Done
    // 从 Immutable Memtable 查找
    } else if (imm != nullptr && imm->Get(lkey, value, &s)) {
      // Done
    // 从 SSTable 文件中查找
    } else {
      s = current->Get(options, lkey, value, &stats);
      have_stat_update = true;
    }
    mutex_.Lock();
  }
  // 更新 SST 文件的统计信息，根据统计结果决定是否调度后台 Compaction
  if (have_stat_update && current->UpdateStats(stats)) {
    MaybeScheduleCompaction();
  }
  // MemTable、Immutable Memtable 和 Current Version 减少引用计数
  mem->Unref();
  if (imm != nullptr) imm->Unref();
  current->Unref();
  return s;
}
```
注意：MemTable、Immutable Memtable 和 Current Version 查找不需要加锁，因为前两个是 SkipList，其读操作是线程安全的，只需要通过引用计数保证数据结构不被回收即可。Current Version 内部是 SSTable 文件，都是只读操作，也无需加锁。


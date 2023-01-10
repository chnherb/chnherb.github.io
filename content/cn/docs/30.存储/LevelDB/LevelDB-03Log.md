---
categories: ["db"]
tags: ["LevelDB"]
title: "LevelDB-03Log"
# linkTitle: ""
weight: 10
description: >

---

## Log作用

对于DB最怕的就是数据的丢失。当服务挂掉时，应尽可能的减少数据丢失。在 leveldb 中引入了 WAL 日志。

## 基本组成

每个 Log 被划分成了很多 32K 大小的物理 block，写入、读取操作都是以 block 为单位进行。

```c++
// log_format.h
enum RecordType {
  // Zero is reserved for preallocated files
  kZeroType = 0,
  kFullType = 1,
  // For fragments
  kFirstType = 2,
  kMiddleType = 3,
  kLastType = 4
};
static const int kMaxRecordType = kLastType;
static const int kBlockSize = 32768;
// Header is checksum (4 bytes), length (2 bytes), type (1 byte).
static const int kHeaderSize = 4 + 2 + 1;
```

## 写入流程

入口：

```c++
// db_impl.cc
// Status DBImpl::Write(const WriteOptions& options, WriteBatch* updates)
{
  mutex_.Unlock();
  status = log_->AddRecord(WriteBatchInternal::Contents(write_batch));
  bool sync_error = false;
  if (status.ok() && options.sync) {
    status = logfile_->Sync();
    if (!status.ok()) {
      sync_error = true;
    }
  }
  if (status.ok()) {
    status = WriteBatchInternal::InsertInto(write_batch, mem_);
  }
  mutex_.Lock();
```
### AddRecord

```c++
// log_writer.cc
// Status Writer::AddRecord(const Slice& slice)
bool begin = true;
do {
  // 检查剩余可以写的空间
  const int leftover = kBlockSize - block_offset_;
  assert(leftover >= 0);
  // 小于kHeaderSize，则需要开启新的block，因为kHeaderSize是必须要写的
  if (leftover < kHeaderSize) {
    // Switch to a new block
    // 剩余空间使用0填充
    if (leftover > 0) {
      // Fill the trailer (literal below relies on kHeaderSize being 7)
      static_assert(kHeaderSize == 7, "");
      dest_->Append(Slice("\x00\x00\x00\x00\x00\x00", leftover));
    }
    // 开启新的block，重置
    block_offset_ = 0;
  }
  // Invariant: we never leave < kHeaderSize bytes in a block.
  assert(kBlockSize - block_offset_ - kHeaderSize >= 0);
  const size_t avail = kBlockSize - block_offset_ - kHeaderSize;
  const size_t fragment_length = (left < avail) ? left : avail;
  RecordType type;
  // 计算是否刚好填满该block
  const bool end = (left == fragment_length);
  if (begin && end) { // 新block且刚好装下
    type = kFullType;
  } else if (begin) { // 新block，一个装不下
    type = kFirstType;
  } else if (end) { // 上一份数据到该block
    type = kLastType;
  } else {    // 其它场景
    type = kMiddleType;
  }
  s = EmitPhysicalRecord(type, ptr, fragment_length);
  ptr += fragment_length;
  left -= fragment_length;
  begin = false;
} while (s.ok() && left > 0);
```
### EmitPhysicalRecord

接着查看 EmitPhysicalRecord 函数

```plain
Status Writer::EmitPhysicalRecord(RecordType t, const char* ptr,
                                  size_t length) {
  assert(length <= 0xffff);  // Must fit in two bytes
  assert(block_offset_ + kHeaderSize + length <= kBlockSize);

  // Format the header
  char buf[kHeaderSize];
  // 序列化长度和recordtype信息
  buf[4] = static_cast<char>(length & 0xff);
  buf[5] = static_cast<char>(length >> 8);
  buf[6] = static_cast<char>(t);

  // Compute the crc of the record type and the payload.
  uint32_t crc = crc32c::Extend(type_crc_[t], ptr, length);
  crc = crc32c::Mask(crc);  // Adjust for storage
  EncodeFixed32(buf, crc);

  // Write the header and the payload
  Status s = dest_->Append(Slice(buf, kHeaderSize));
  if (s.ok()) {
    s = dest_->Append(Slice(ptr, length));
    if (s.ok()) {
      s = dest_->Flush();
    }
  }
  block_offset_ += kHeaderSize + length;
  return s;
}
```

### Sync

注意 DBImpl::Write 函数中调用完 AddRecord 后立马调用了 Sync 函数进行了同步。

## 删除日志

doc(**doc/impl.md**)文档里面讲解了，在打开数据库以及compact之后，会将不再使用的文件删除，使用的函数是 RemoveObsoleteFiles。可以通过添加日志或者 gdb 来查看。

### 打开数据库

```c++
// db_impl.cc
// Status DB::Open(const Options& options, const std::string& dbname, DB** dbptr)
if (s.ok()) {
  impl->RemoveObsoleteFiles();
  impl->MaybeScheduleCompaction();
}
impl->mutex_.Unlock();
```
### 数据压缩

```c++
// void DBImpl::CompactMemTable() 
if (s.ok()) {
  // Commit to the new state
  imm_->Unref();
  imm_ = nullptr;
  has_imm_.store(false, std::memory_order_release);
  RemoveObsoleteFiles();
} else {
  RecordBackgroundError(s);
}
```


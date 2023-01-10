---
categories: ["db"]
tags: ["LevelDB"]
title: "LevelDB-05Cache"
# linkTitle: ""
weight: 10
description: >

---

## 简介

为了读取效率使用了 Cache 机制。主要是 Table Cache 和 Block Cache 两类。

Table Cache 主要是缓存 SST 文件的 data block index，Block Cache 主要是缓存 data block。

## 通用接口

代码：include/leveldb/cache.h

```c++
class LEVELDB_EXPORT Cache {
 public:
  Cache() = default;
  Cache(const Cache&) = delete;
  Cache& operator=(const Cache&) = delete;
  // Destroys all existing entries by calling the "deleter"
  // 调用 deleter 删除所有 entries
  virtual ~Cache();
  // Opaque handle to an entry stored in the cache.
  // 存储的 entry，除了kv还有一些维护信息，这里是通用接口所以没有定义
  struct Handle {};
  // 插入kv，charge 表示本次插入操作对cache容量的消耗
  // entry 被淘汰是，使用 deleter 进行删除
  virtual Handle* Insert(const Slice& key, void* value, size_t charge,
                         void (*deleter)(const Slice& key, void* value)) = 0;
  // 查找接口
  virtual Handle* Lookup(const Slice& key) = 0;
  // 释放 handle
  virtual void Release(Handle* handle) = 0;
  // 获取 handle 的 value
  virtual void* Value(Handle* handle) = 0;
  // 删除对应 key 记录
  // 真正的存储记录，所有相关的 handles 都释放了才会被删除
  virtual void Erase(const Slice& key) = 0;
  // 生成 cacheid
  virtual uint64_t NewId() = 0;
  // 删除 lru_ 链上的记录
  virtual void Prune() {}
  // cache 的开销，Insert 接口传入 charge 之和
  virtual size_t TotalCharge() const = 0;
};
```

## LRUHandle

代码：util/cache.cc

LRUHandle 类主要用于自定义的 hashtable 和 LRU 中的节点。

```c++
struct LRUHandle {
  void* value;
  // 删除器，refs==0 调用deleter完成value对象释放
  void (*deleter)(const Slice&, void* value);
  // HashTable 节点，指向hash值相同的节点（采用链地址法解决hash冲突）
  LRUHandle* next_hash;
  // LRUCache 节点，指向后继
  LRUHandle* next;
  // LRUCache 节点，指向前驱
  LRUHandle* prev;
  // 用户指定占用缓存的大小
  size_t charge;  // TODO(opt): Only allow uint32_t?
  size_t key_length;
  bool in_cache;     // Whether entry is in the cache.
  uint32_t refs;     // References, including cache reference, if present.
  uint32_t hash;     // Hash of key(); used for fast sharding and comparisons
  char key_data[1];  // Beginning of key
```
## LRUCache

### 数据结构

```c++
class LRUCache {
 public:
  LRUCache(); // 初始化双向链表
  ~LRUCache();
  // Separate from constructor so caller can easily make an array of LRUCache
  void SetCapacity(size_t capacity) { capacity_ = capacity; }
  // Like Cache methods, but with an extra "hash" parameter.
  // 插入数据到 Cache 中，这里保存节点的 hash 值，方便快速比对
  Cache::Handle* Insert(const Slice& key, uint32_t hash, void* value,
                        size_t charge,
                        void (*deleter)(const Slice& key, void* value));
  // 查询目标节点
  Cache::Handle* Lookup(const Slice& key, uint32_t hash);
  // 释放句柄(操作引用)
  void Release(Cache::Handle* handle);
  // 从缓存中删除节点
  void Erase(const Slice& key, uint32_t hash);
  // 手动检测是否有需要删除的节点，发生在节点超过容量之后
  void Prune();
  // 当前缓存中数据所占用的内存
  size_t TotalCharge() const {
    MutexLock l(&mutex_);
    return usage_;
  }
 private:
  void LRU_Remove(LRUHandle* e);
  void LRU_Append(LRUHandle* list, LRUHandle* e);
  // 增加引用
  void Ref(LRUHandle* e);
  // 节点引用为0，调用 free 函数，否则只能移动
  void Unref(LRUHandle* e);
  bool FinishErase(LRUHandle* e) EXCLUSIVE_LOCKS_REQUIRED(mutex_);
  // Initialized before use.
  // LRU 容量
  size_t capacity_;
  // mutex_ protects the following state.
  // id 生成锁，保护 LRUCache 操作
  mutable port::Mutex mutex_;
  // 获取 LRUCache 已经使用的内存
  size_t usage_ GUARDED_BY(mutex_);
  // Dummy head of LRU list.
  // lru.prev is newest entry, lru.next is oldest entry.
  // Entries have refs==1 and in_cache==true.
  // 只存在缓存中的节点
  LRUHandle lru_ GUARDED_BY(mutex_);
  // Dummy head of in-use list.
  // Entries are in use by clients, and have refs >= 2 and in_cache==true.
  // 既存在缓存中，又被外部引用的节点
  LRUHandle in_use_ GUARDED_BY(mutex_);
  // 用户快速获取某个节点
  HandleTable table_ GUARDED_BY(mutex_);
};
```
注意事项：
* LRU 中元素不仅在 cache 中，也可能会被外部引用，不能直接删除节点
* 某个节点被修改或引用，空间不足不能参与 LRU 计算
* in_use 表示既在 cache 中，也被外部引用
* table_ 记录 key 和节点的映射关系，通过key可以快速定位到某个节点
* 调用 insert/LookUp 之后，必须使用 Release 释放句柄
### Insert函数

代码：util/cache.cc

```c++
Cache::Handle* LRUCache::Insert(const Slice& key, uint32_t hash, void* value,
                                size_t charge,
                                void (*deleter)(const Slice& key,
                                                void* value)) {
  // 加锁
  MutexLock l(&mutex_);
  // 创建节点
  LRUHandle* e =
      reinterpret_cast<LRUHandle*>(malloc(sizeof(LRUHandle) - 1 + key.size()));
  e->value = value;
  e->deleter = deleter;
  e->charge = charge;
  e->key_length = key.size();
  e->hash = hash;
  e->in_cache = false;
  // 引用数
  e->refs = 1;  // for the returned handle.
  std::memcpy(e->key_data, key.data(), key.size());
  // 容量大于0时开启缓存
  if (capacity_ > 0) {
    // 会放入缓存中，因此存在两个地方，引用数加1
    e->refs++;  // for the cache's reference.
    e->in_cache = true;
    // 外部会引用，所以节点需要放在 in_use_ 链上
    LRU_Append(&in_use_, e);
    // 加上新增的字节数
    usage_ += charge;
    // 如果存在该节点，需要将老的节点释放
    FinishErase(table_.Insert(e));
  } else {  // don't cache. (capacity_==0 is supported and turns off caching.)
    // next is read by key() in an assert, so it must be initialized
    e->next = nullptr;
  }
  // 当cache容量不够，有空余的节点需要进行 LRU 策略淘汰
  // 注意 in_use_ 中的节点不能被淘汰，因为被外部引用了
  while (usage_ > capacity_ && lru_.next != &lru_) {
    LRUHandle* old = lru_.next;
    assert(old->refs == 1);
    bool erased = FinishErase(table_.Remove(old->key(), old->hash));
    if (!erased) {  // to avoid unused variable when compiled NDEBUG
      assert(erased);
    }
  }
  return reinterpret_cast<Cache::Handle*>(e);
}
```

### ref/Unref函数

代码：util/cache.cc

Ref

```c++
void LRUCache::Ref(LRUHandle* e) {
  if (e->refs == 1 && e->in_cache) {  // If on lru_ list, move to in_use_ list.
    LRU_Remove(e);
    LRU_Append(&in_use_, e);
  }
  e->refs++;
}

```
Unref
```plain
void LRUCache::Unref(LRUHandle* e) {
  assert(e->refs > 0);
  // 引用减1
  e->refs--;
  if (e->refs == 0) {  // Deallocate.
    assert(!e->in_cache);
    (*e->deleter)(e->key(), e->value);
    free(e);
  } else if (e->in_cache && e->refs == 1) {
    // No longer in use; move to lru_ list.
    // 仅在缓存中且引用数为1，将其从 in_use_ 中删除，放到 LRU 中
    LRU_Remove(e);
    LRU_Append(&lru_, e);
  }
}
```


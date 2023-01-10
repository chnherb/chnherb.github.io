---
categories: ["db"]
tags: ["LevelDB"]
title: "LevelDB-06Compaction"
# linkTitle: ""
weight: 10
description: >

---



## 分类

LevelDB 中，compaction 有两种：

* minor compaction
>immutable memtable 持久化为 sst 文件

* major compaction
>sst 文件之间的 compaction

    * Manual Compaction：人工触发，外部接口调用产生
    * Size Compaction：每个 level 文件大小超过一定阈值就会触发
    * Seek Compaction：一个文件的 seek miss 次数超过阈值就会触发
优先级：Minor > Manual > Size > Seek

## 成员变量

代码：

db/version_set.h

```c++
// 需要压缩的 level
int level_;
// 压缩之后最大的文件大小，等于 options->max_file_size
uint64_t max_output_file_size_;
// 当前操作的版本
Version* input_version_;
// 版本变化
VersionEdit edit_;
// Each compaction reads inputs from "level_" and "level_+1"
// level 和 level 两层需要参与压缩的文件元数据
std::vector<FileMetaData*> inputs_[2];  // The two sets of inputs
// State used to check for number of overlapping grandparent files
// (parent == level_ + 1, grandparent == level_ + 2)
// grandparents元数据
std::vector<FileMetaData*> grandparents_;
// grandparent下标索引
size_t grandparent_index_;  // Index in grandparent_starts_
bool seen_key_;             // Some output key has been seen
// 当前压缩与grandparent元数据重叠的字节数
int64_t overlapped_bytes_;  // Bytes of overlap between current output
                            // and grandparent files
// State for implementing IsBaseLevelForKey
// level_ptrs_ holds indices into input_version_->levels_: our state
// is that we are positioned at one of the file ranges for each
// higher level than the ones involved in this compaction (i.e. for
// all L >= level_ + 2).
// 记录某个 user_key 与 >= level+2 中每一层不重叠的文件个数
size_t level_ptrs_[config::kNumLevels];
```

## 主要函数

```c++
// Return the level that is being compacted.  Inputs from "level"
// and "level+1" will be merged to produce a set of "level+1" files.
// 返回将要压缩的 level 文件
int level() const { return level_; }
// Return the object that holds the edits to the descriptor done
// by this compaction.
VersionEdit* edit() { return &edit_; }
// "which" must be either 0 or 1
// 返回对应层级参与压缩的文件
int num_input_files(int which) const { return inputs_[which].size(); }
// Return the ith input file at "level()+which" ("which" must be 0 or 1).
// 获取某一层第 i 个文件的 sst 元数据
FileMetaData* input(int which, int i) const { return inputs_[which][i]; }
// Maximum size of files to build during this compaction.
// 本次压缩产生的最大文件大小
uint64_t MaxOutputFileSize() const { return max_output_file_size_; }
// Is this a trivial compaction that can be implemented by just
// moving a single input file to the next level (no merging or splitting)
// 表示本地是否可以将本次 sst 直接移动到上一层
bool IsTrivialMove() const;
// Add all inputs to this compaction as delete operations to *edit.
// 添加所有需要删除 sst 文件到 *edit
// input 经过变化生成 output，input对应 deleted_file 容器，output进入 added_file 容器
// add时先忽略 deleted
void AddInputDeletions(VersionEdit* edit);
// Returns true if the information we have available guarantees that
// the compaction is producing data in "level+1" for which no data exists
// in levels greater than "level+1".
// 判断当前user_key在 >=(level+2) 层中是否存在。
// 主要用于key的 type=deletion 时是否将该 key 删除
bool IsBaseLevelForKey(const Slice& user_key);
// Returns true iff we should stop building the current output
// before processing "internal_key".
// 是否需要停止输出，生成新的SST，
// 避免合并到 level+1 层之后和 level+2 层重叠太多，导致下次合并level+1时间太久
bool ShouldStopBefore(const Slice& internal_key);
// Release the input version for the compaction, once the compaction
// is successful.
// 释放内存
void ReleaseInputs();
```

## Minor Compaction

### 定义

immutable memtable 持久化为 sst 文件。

### 触发条件

Wirte 新数据进入 LevelDB 时，会在适当的时机检查内存中 Memtable 占用内存大小，一旦超过 options_.write_buffer_size (默认4M)，就会尝试 Minor Compaction。

### 执行过程

* DBImpl::BackgroundCompaction -> DBImpl::CompactMemTable -> DBImpl::WriteLevel0Table
    * BuildTable：将 immutable memtable 格式化成 sstable 文件。
    * PickLevelForMemTableOutput：计算新生成的sstable所属的层级。
    * edit->AddFile()：将新sst文件放置到第2步选出的level中。
策略上尽量将新 compact 文件推至高 level。因为如果 level0 需要控制的文件过多，compaction IO 和查找都比较耗费。另一方面也不能推至过高level，某些范围的key更新比较频繁，后续往高层 compaction IO 消耗也很大。

### 层级选择

* 新 sst key 范围和 level0 的某个或某几个 sst 文件是否有重叠
    * 是，level = 0
* 否，新 sst key 范围和 level1 的某个或某几个 sst 文件是否有重叠
    * 是，level = 0
* 否，level2 文件中与新 sst 有重叠文件个数过多，size之和是否超过阈值
    * 是，level = 0
* 否，新 sst key 范围和 level2 的某个或某几个 sst 文件是否有重叠
    * 是，level = 1
* 否，level3 文件与新 sst 重叠文件个数过多，size之和是否超过阈值
    * 是，level = 1
* 否，level = 2
基本判断原则：

* 当前level n，推向下一层level的条件是：与 level n+1 不能重叠，与 level n+2 重叠的文件大小不能超过阈值
* level 最大不超过2
## Major Compaction

Major compaction 是将不同层级的 sst 的文件进行合并。

作用：

* 将不活跃的数据下沉，均衡各个level的数据，保证 read 的性能
* 合并 delete 数据，释放磁盘空间，因为删除是标记删除
* 合并 update 数据，例如put同一个key，类似于 delete，是采用的标记插入新的数据，实际的update是在compact中完成，并实现空间的释放
### Size Compaction

#### 定义

LevelDB 的核心 Compact 过程，其主要是为了均衡各个level的数据，从而保证读写的性能均衡。

主要是指某一层 sst 文件不能太大，这个大对 level0 层来说是 sst 文件过多，因为 level0 层会被频繁访问，而对于其他层表示字节数太大，具体见Builder类的Finalize函数。

#### 触发条件

LevelDB 会计算每个level的总的文件大小，并根据此计算出一个score，最后会根据这个score来选择合适level和文件进行Compact。具体得分原则见：

```c++
VersionSet::Finalize
```
进行 Compation 时，判断得分是否大于 1，是则进行 Size Compaction。代码见：
```c++
VersionSet::PickCompaction
```

#### 执行过程

* score计算：各 level 触发得分，得到 compaction 层级（VersionSet::Finalize）
    * level0: level0文件总数 / 4
    * 其它 level：当前level所有文件size之和 / 当前 level 阈值
* 寻找 compaction 的文件，如 level n：
    * 确定 level n 参与 compation 的文件列表 ，存入inputs_[0] （核心函数：VersionSet::PickCompaction）
    * 确定 level n+1 参与 compation 的文件列表，存入inputs_[1]（核心函数：VersionSet::SetupOtherInputs）
### Seek Compaction

#### 定义

主要记录的是某个 sst seek 次数到达阈值之后，将会参与下一次压缩。

LevelDB 认为如果一个 sst 文件在 level i 中总是没总到，而是在 level i+1 中找到，这说明两层之间key的范围重叠很严重。当这种 seek miss 积累到一定次数之后，就考虑将其从 level i 中合并到 level i+1 中，这样可以避免不必要的 seek miss 消耗 read I/O。

#### 触发条件

当 allowed_seeks 递减到小于0了，将标记为需要 compation 的文件。但是由于 Size Compaction 优先级高于 Seek Compaction，所以在不存在 Size Compaction 时且触发了Compaction，Seek Compaction 就能执行。

#### 执行过程

* 获取 compaction 文件（Version::UpdateStats）
* 寻找 compaction 的文件，如 level n：
    * 确定 level n 参与 compation 的文件列表 ，存入inputs_[0] （核心函数：VersionSet::PickCompaction）
    * 确定 level n+1 参与 compation 的文件列表，存入inputs_[1]（核心函数：VersionSet::SetupOtherInputs）
具体代码见：DBImpl::DoCompactionWork

### Manual Compact

#### 定义

人工触发的Compaction，由外部接口调用产生。实际内部触发调用的接口是 DBImpl 中的

```c++
// begin/end 表示 compaction 的范围
// begin/end 为 null 时，表示尝试 compact 所有文件
void DBImpl::CompactRange(const Slice begin, const Slice end)
```
Manual Compaction 中会指定 begin 和 end。它将会逐个 level 分次的 Compact 所有level 中与 begin 和 end 有重叠（overlap）的 sst 文件。
#### 触发条件

人工触发，由外部调用。

#### 执行过程

* 遍历所有level，获取到最大重叠的层级（核心函数：OverlapInLevel）
* 强制将当前的 memtable 进行 minor compation。（核心函数：TEST_CompactMemTable）
* 遍历重叠的层级进行 major compation（核心函数：TEST_CompactRange）
* 真正的 compation（核心函数：VersionSet::CompactRange）

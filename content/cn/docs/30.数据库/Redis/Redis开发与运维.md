---
categories: ["Redis"] 
tags: [""] 
title: "Redis开发与运维"
# linkTitle: ""
weight: 5
description: >
  
---



# 01 初始Redis

## 1.1 盛赞Redis 

    Redis中的值可以是由string、hash、list、set、zset、Bitmaps（位图）、HyperLogLog、GEO（地理信息定位）等多种数据结构和算法组成。     

## 1.2 Redis特性 

1、速度快 

* 存储在内存中 
* C语言编写，一般来说C语言编写的程序“距离”操作系统更近 
* 单线程架构，预防了多线程可能产生的竞争 
* 作者对源代码精打细磨（稍有的集性能和优雅于一身的开源代码） 

2、基于键值对的数据结构服务器 

3、丰富的功能 

    除了5中数据结构，还提供了许多额外功能： 

* 键过期功能，可以实现缓存 
* 发布订阅功能，可以实现消息系统 
* 支持Lua脚本功能，可以利用Lua创造出新的Redis命令 
* 简单的事务功能，能在一定程度上保证事务特性 
* 流水线（Pipeline）功能，使客户端能将一批命令一次性传到Redis，减少网络开销 

4、简单稳定 

* 源码少（早期2万行，3.0版本以后增加集群，5万行） 
* 单线程模型，服务端处理模型简单，客户端开发简单 
* 不依赖与操作系统中类库，自己实现了事件处理的相关功能
 

5、客户端语言多 

    提供简单的TCP协议 

6、持久化 

    两种持久化方式:RDB和AOF 

7、主从复制 

8、高可用和分布式 

    高可用实现Redis Sentinel保证Redis节点的故障发现和故障自动转移；分布式实现Redis Cluster 

## 1.3 Redis使用场景 

### 1.3.1 Redis可以做什么 

1. 缓存 
2. 排行榜系统 
3. 计数器应用 
4. 社交网络 
5. 消息队列系统 

### 1.3.2 Redis不可以做什么 

    数据量大的、冷数据 

## 1.4 用好Redis的建议 

## 1.5 正确安装并启动Redis 

## 1.6 Redis重大版本 

    借鉴Linux操作系统对于版本号的命名规则，版本号第二位如果是奇数，则为非稳定版本，偶数则为稳定版本 

1、Redis 2.6 

    2012年正式发布 

    1）服务端支持Lua脚本 

    2）去掉虚拟内存相关功能 

    3）放开对客户端连接数的硬编码限制 

    4）键的过期时间支持毫秒 

    5）从节点提供只读功能 

    6）两个新的位图命令：bitcount和bitop 

    7）增强redis-benchmark的功能：支持定制化的压测，CSV输出等功能 

    8）基于浮点数自增命令：incrbyfloat和hincrbyfloat 

    9）redis-cli可以使用--eval参数实现Lua脚本执行 

    10）shutdown命令增强 

    11）info可以按照section输出，并且添加了一些统计项 

    12）重构了大量的核心代码，所有集群相关的代码都去掉了，cluster功能将会是3.0版本最大的亮点 

    13）sort命令优化 

2、Redis 2.8 

    2013年11月22日正式发布 

    1）添加部分主从复制的功能，在一定程度上降低了由于网络问题，造成频繁全量复制生成RDB对系统造成的压力 

    2）尝试性地支持IPv6 

    3）可以通过config set命令设置maxclients 

    4）可以用bind命令绑定多个IP地址 

    5）Redis设置明显的进程名，方便使用ps命令查看系统进程 

    6）confi rewrite命令可以将config set持久化到Redis配置文件中 

    7）发布订阅添加了pubsub命令 

    8）Redis Sentinal第二版，相比于Redis 2.6的Redis Sentinel，此版本变成生产可用 

3、Redis 3.0 

    2015年4月1日正式发布 

    1）Redis Cluster：Redis的官方分布式实现 

    2）全新的embedded string对象编码结果，优化小对象内存访问，在特定的工作负载下速度大幅提升 

    3）lru算法大幅提升 

    4）migrate链接缓存，大幅提升迁移的速度 

    5）migrate命令两个新的参数copy和replace 

    6）新的client pause命令，在指定时间内停止处理客户端请求 

    7）bitcount命令性能提升 

    8）confit set设置maxmemory时可以设置不同的单位（之前只能是字节），例如config set maxmemory 1gb 

    9）Redis日志小做调整：日志中会反应当前实例的角色（master或者slave） 

    10）incr命令性能提升 

4、Redis 3.2 

    2016年5月6日正式发布 

    1）添加GEO相关功能 

    2）SDS在速度和节省空间上都做了优化 

    3）支持用upstart或者systemd管理Redis进程 

    4）新的List编码类型：quicklist 

    5）从节点读取过期数据保持一致性 

    6）添加hstrlen命令 

    7）增强了debug命令，支持了更多的参数 

    8）Lua脚本功能增强 

    9）添加了Lua Debugger 

    10）config set支持更多的配置参数 

    11）优化了Redis崩溃后的相关报告 

    12）新的RDB格式，但是仍然兼容旧的RDB 

    13）加速RDB的加载速度 

    14）spop命令支持个数参数 

    15）cluster nodes命令支持个数参数 

    16）Jemalloc更新到4.0.3版本 

5、Redis 4.0 

    1）模块系统，方便第三方开发者扩展Redis功能 

    2）PSYNC 2.0：优化了之前版本中，主从节点切换必然引起全量复制的问题 

    3）提供了新的缓存提出算法：LFU(Last Frequently Used)，并优化已有算法 

    4）提供了非阻塞del和flushall/flushdb功能，有效解决删除bigkey可能造成的Redis阻塞 

    5）提供了RDB-AOF混合持久化格式，充分利用了AOF和RDB各自优势 

    6）提供了memory命令，实现对内存更为全面的监控统计 

    7）提供了交互数据库功能，实现Redis内部数据库之间的数据置换 

    8）Redis Cluster兼容NAT和Docker 

# 02 API的理解与使用

## 2.1 预备 

### 2.1.1 全局命令 

1. key*  查看所有键 
2. dbsize  键总数 
3. exists key  检查键是否存在 
4. del key  删除键 
5. expire key seconds  键过期 
6. type key  键的数据结构类型 

### 2.1.2 数据结构和内部编码 

    每种数据结构都有两种以上的内部编码实现，例如list包含linkedlist和ziplist，可使用object encoding key来查看 

### 2.1.3 单线程架构 

    Redis使用单线程架构和I/O多路复用模型来实现高性能的内存数据库服务。 

    每次客户端调用都经历发送命令、执行命令、返回结果三个过程。 

    采用I/O多路复用技术来解决I/O的问题。 

    单线程快的原因： 

1. 纯内存访问（响应时长100纳秒） 
2. 非阻塞I/O（使用epoll作为I/O多路复用技术，加上Redis自身的事件处理模型将epoll中的连接、读写、关闭都转换为事件，不在网络I/O上浪费时间） 
3. 单线程避免了线程切换和竞态产生的消耗 

## 2.2 字符串 

    值最大不超过512MB 

### 2.2.1 命令 

1、set key value 

ex seconds：设置秒级过期时间 

px milliseconds：设置毫秒级过期时间 

nx： 键必须不存在，才可以设置成功，用于添加，分布式锁 

xx：与nx相反，用于更新 

mset key value [key value …] 

2、get key     

mget key [key …] 

1. incr key 计数 
2. append key value 追加字符串值 
3. strlen key 字符串长度 
4. getset key value 
5. setrange key offset value 
6. getrange key start end 

### 2.2.2 内部编码 

    字符串的内部编码有3种： 

* int：8个字节的长整形 
* embstr：小于等于39个字节的字符创 
* raw：大于39个字节的字符串
 

Redis会根据当前值的类型和长度决定使用哪种内部编码实现 

### 2.2.3 典型使用场景 

1. 缓存功能 
2. 计数 
3. 共享session 
4. 限速（一分钟不超过x次）
 

## 2.3 哈希 

### 2.3.1 命令 

### 2.3.2 内部编码 

    哈希类型的内部编码有两种： 

* ziplist（压缩列表）：当元素个数小于hash-max-ziplist-entries(512)、同时所有值都小于hash-max-ziplist-vallue(64)时 
* hashtable（哈希表）：无法满足ziplist的条件
 

## 2.4 列表 

### 2.4.1 命令 

### 2.4.2 内部编码 

* ziplist（压缩列表）：同上 
* linkedlist（链表）：同 

## 2.5 集合 

### 2.5.2 内部编码 

* intset（整数集合） 
* hashtable（哈希表）
 

## 2.6 有序集合 

### 2.6.2 内部编码 

* ziplist（压缩列表） 
* skiplist（跳跃表）
 

## 2.7 键管理 

# 03 小功能大用处

## 3.1 慢查询分析 

```shell
config set slowlog-log-slower-than 20000
config set slowlog-max-len 1000
config rewrite
slowlog get
slowlog len 
```

## 3.2 Redis shell 

```shell
redis-cli
redis-server
redis-benchmark 
```

## 3.3 Pipeline 

    RTT（Round Trip Time，往返时间），节省网络传输时间，一次性执行多个命令 

## 3.4 事务与Lua 

### 3.4.3 Redis与Lua 

    eval和evalsha 

# 04 客户端

## 4.1 客户端通信协议 

## 4.2 Java客户端Jedis 

## 4.3 Python客户端redis-py 

```python
# 1、引入依赖，生成客户端连接
import redis
client = redis.StrictRedis(host=‘127.0.0.1’, port=6379)
# 2、生成pipeline
pipeline = redis.pipelien(transaction=False)
# 3、将命令封装到pipeline中
pipeline.set(“hello”,”world”)
pipelien.incr(“counter”)
# 4、执行pipeline
result = pipeline.execute() 
```

## 4.4 客户端管理 

### 4.4.1 客户端API 

```shell
client list
info clients 
```


# 05 持久化

## 5.1 RDB 

### 5.1.1 触发机制 

```shell
# 手动触发命令
save # 阻塞当前Redis服务器，直到RDB过程完成
bgsave # 阻塞只发生在fork阶段，一般时间很短 

# 自动触发命令
save m n # m秒内数据集存在n次修改
debug reload
shutdown # 默认情况下执行，如果没有开启AOF持久化功能则自动执行bgsave 
```

### 5.1.2 流程说明 

bgsave是主流的触发RDB持久化方式，流程如下： 

1）执行bgsave命令，Redis父进程判断当前是否存在正在执行的子进程，如RDB/AOF子进程，如果存在bgsave命令直接返回 

2）父进程执行fork操作创建子进程，fork操作过程中父进程会阻塞，通过info stats命令查看latest_fork_usec选项，可以获取最近一个fork操作的耗时，单位为微秒 

3）父进程fork完成后，bgsave命令返回“Background saving started”信息并不再阻塞父进程，可以继续响应其他命令 

4）子进程创建RDB文件，根据父进程内存生成临时快照文件，完成后对原有文件进行原子替换。（执行lastsave命令可以获得最后一次生成RDB的时间，对应info统计的rdb_last_save_time选项 

5）进程发送信号给父进程表示完成，父进程更新统计信息，具体见info Persistence下的rdb_*相关选项 

### 5.1.3 RDB文件的处理 

    压缩：默认采用LZF算法对生成的RDB文件进行压缩处理，如果文件损坏，可以使用redis-check-dump检测获取错误报告 

### 5.1.4 RDB的优缺点 

优点： 

1. 紧凑压缩的二进制文件，非常适合用于备份，全量复制等场景 
2. Redis加载RDB恢复数据远远快于AOF的方式
 

缺点： 

1. 没有办法做到实时持久化/秒级持久化。因为bgsave每次运行都要执行fork操作创建子进程，属于重量级操作，频繁执行成本过高。 
2. 二进制文件保存，版本更替有多个格式，存在老版本服务无法兼容新版格式的问题
 

## 5.2 AOF(append only file) 

    追加命令到文件实现持久化 

### 5.2.3 文件同步 

### 5.2.4 重写机制 

    重写后的AOF文件变小的原因： 

1）进程内已超时的数据不再写入文件 

2）旧的AOF文件含有无效命令，只保留最终数据的写入命令 

3）多条写命令可以合并为一个 

    重写过程可以手动触发和自动触发： 

```shell
# 手动触发 直接执行
bgrewriteaof
 
# 自动触发  参数确定自动触发时机
# auto-aof-rewrite-min-size 运行重写时文件的最小体积，默认64M
# auto-aof-rewrite-percentage 当前AOF文件空间和上一次重写后的比值 
```

# 06 复制

## 6.1配置 

### 6.1.1 建立复制 

    配置复制的方式： 

1. 在配置文件中加入slaveof {masterHost} {masterPort}随Redis启动生效 
2. 在redis-server启动命令后加入—slaveof {masterHost} {masterPort} 
3. 直接使用命令：slaveof {masterHost} {masterPort}生效
 

## 6.2 拓扑 

1. 一主一从结构 
2. 一主多从结构 
3. 树状主从结构
 

## 6.3 原理 

### 6.3.1 复制过程 

1. 保存主节点信息 
2. 从节点内部通过每秒运行的定时任务维护复制相关逻辑，当定时任务发现存在新的主节点后，会尝试与该节点建立网络连接 
3. 发送ping命令 
4. 权限验证 
5. 同步数据集 
6. 命令持续复制
 

### 6.3.2 数据同步 

* 全量复制 
* 部分复制 

## 6.4 开发与运维中的问题 

### 6.4.1 读写分离 

    当使用从节点响应读请求时，业务端可能会遇到如下问题： 

1、数据延迟 

2、读到过期数据 

    Redis内部需要维护过期数据删除策略：惰性删除和定时删除 

3、从节点故障问题 

### 6.4.2 主从配置不一致 

### 6.4.3 规避全量复制 

### 6.4.4 规避复制风暴 

# 07 Redis的噩梦：阻塞

## 7.1 发现阻塞 

    在实现异常统计时要注意，由于Redis调用API会分散在项目的多个地方，每个地方都监听异常并加入监控代码必然难以维护。可以借助日志系统！（RedisAppender） 

## 7.2 内在原因 

### 7.2.1 API或数据结构使用不合理 

1、如何发现慢查询 

slowlog get {n} # 获取最近的n条慢查询命令 

调整方向：1）修改为低算法度的命令，如hgetall改为hmget等，禁用keys、sort等命令；2）调整大对象，拆分为小对象，防止一次命令操作过多的数据 

2、如何发现大对象 

redis-cli -h {ip} -p {port} -—bigkeys 

redis-cli —-bigkeys 

### 7.2.2 CPU饱和 

### 7.2.3 持久化相关的阻塞 

1、fork阻塞 

2、AOF刷盘阻塞 

3、HugePage写操作阻塞 

## 7.3 外在原因 

### 7.3.1 CPU竞争 

### 7.3.2 内存交换 

### 7.3.3 网络问题 

1、连接拒绝（网络闪断、Redis连接拒绝、连接溢出） 

2、网络延迟 

3、网卡软中断 

# 08 理解内存

## 8.1 内存消耗 

### 8.1.1 内存使用统计 

```shell
info memory 
```

### 8.1.2 内存消耗划分 

    Redis进程内消耗主要包括：自身内存+对象内存+缓冲内存+内存碎片 

1、对象内存 

    可以简单理解为sizeof(keys) + sizeof(values) 

2、缓冲内存 

    主要包括：客户端缓冲、复制挤压缓冲区、AOF缓冲区 

3、内存碎片 

### 8.1.3 子进程内存消耗 

## 8.2 内存管理 

### 8.2.1 设置内存上限 

### 8.2.2 动态调整内存上限 

### 8.2.3 内存回收策略 

1、删除过期键对象 

* 惰性删除 
* 定时任务删除 

2、内存溢出控制策略 

## 8.3 内存优化 

### 8.3.1 redisObject对象 

    Redis存储的所有值对象在内部定义为redisObject结构体 

1、type：表示当前对象使用的数据类型，如string、hash、list、set、zset等，可以使用 type {key}查看对象所属类型 

2、encoding：表示Redis内部编码类型 

3、lru：记录对象最后一次被访问的时间 

4、refcount：记录当前对象被引用的次数，用于引用次数回收内存，当为0时可以安全回收当前对象空间 

5、*ptr：与对象的数据内容相关，如果是整数，直接存储数据；否则指向数据的指针 

### 8.3.2 缩减键值对象 

    降低Redis内存使用最直接的方式就是缩减键（key）和值（value）的长度。序列化工具，如protostuff、kryo等 

### 8.3.3 共享对象池 

    指Redis内部维护[0-9999]的整数对象池。每个redisObject内部结构至少占16字节，用于节约内存 

    问：为什么开启maxmemory和LRU淘汰策略后对象池无效？ 

    答：LRU算法需要获取对象最后被访问时间（lru字段），对象共享意味着多个引用共享同一个redisObject，这是lru字段也会被共享，导致无法获取每个对象的最后访问时间。如果没有设置maxmemory，直到内存被用尽Redis也不回触发内存回收，所以共享对象池可以正常工作。综述：共享对象池与maxmemory+LRU策略冲突，使用时需要注意。 

    问：为什么只有整数对象池？ 

    答：因为整数比较算法时间复杂度为O(1)，只保留一万个整数为了防止对象池浪费。字符串判断相等性，时间复杂度O(n)，特别是长字符串更消耗性能（浮点数在Redis内部使用字符串存储）。更复杂的数据结构如hash、list等，相等性判断需要O(n*n)。 

### 8.3.4 字符串优化 

1、字符串结构 

    Redis没有采用原生C语言的字符串类型而是自己实现了字符串结构，内部简单动态字符串（simple dynamic string, SDS)。 

    Redis自身实现的字符串结构特点： 

* O(1)时间复杂度获取：字符串长度、已用长度、未用长度 
* 可用于保存字节数组，支持安全的二进制数据存储 
* 内部实现空间预分配机制，降低内存再分配次数 
* 惰性删除机制，字符串缩减后的空间不释放，作为预分配空间保留 

2、预分配机制 

3、字符串重构 

### 8.3.5 编码优化 

1、了解编码 

2、控制编码类型 

3、ziplist编码 

4、intset编码 

### 8.3.6 控制键的数量 

# 09 哨兵（Redis Sentinel）

9.1 基本概念 

9.1.1 主从复制的问题 

9.1.2 高可用 

9.1.3 Redis Sentinel的高可用性 

    注意：Redis 2.6（Redis Sentinel v1）功能性和健壮性都有一些问题，建议使用Redis 2.8（Redis Sentinel v2）以上。 

    Redis Sentinel功能： 

* 监控 
* 通知 
* 主节点故障转移 
* 配置提供者 
* 节点的故障判断由多个Sentinel节点共同完成，防止误判 
* Sentinel节点集合由若干个Sentinel节点组成，即使个别不可用，整个节点集合依然是健壮的 
9.2 安装和部署 

9.2.1 部署拓扑结构 

9.2.2 部署Redis数据节点 

9.2.3 部署Sentinel节点 

9.2.4 配置优化 

9.2.5 部署技巧 

9.3 API 

9.4 客户端连接 

9.4.1 Redis Sentinel的客户端 

9.4.2 Redis Sentinel客户端基本实现原理 

9.4.3 Java操作Redis Sentinel 

9.5 实现原理 

9.5.1 三个定时监控任务 

9.5.2 主观下线和客观下线 

9.5.3 领导者Sentinel节点选举 

9.5.4 故障转移 

9.6 开发与运维中的问题 

9.6.1 故障转移日志分析 

9.6.2 节点运维 

9.6.3 高可用读写分离 

# 10 集群

之前Redis分布式方案一般有两种： 

* 客户端分区方案（优点：分区逻辑可控，缺点：自己处理数据路由、高可用、故障转移等问题） 
* 代理方案（优点：简化客户端分布式逻辑和升级维护遍历，缺点：加重架构部署复杂度和性能损耗）
 

官方提供的集群方案：Redis Cluster，优雅地解决了Redis集群方面的问题。 

## 10.1 数据分布 

### 10.1.1 数据分布理论 

    常见的分区规则有哈希分区和顺序分区两种。Redis Cluster采用哈希分区规则。常见的分区规则： 

1、节点取余分区 

2、一致性哈希分区 

优点：加入或删除节点只影响哈希环中相邻的节点，对其它节点无影响。 

问题： 

1. 加减节点会造成哈希环中部分数据无法命中，需要手动处理或者忽略这部分数据，因此一致性哈希常用语缓存场景 
2. 当使用少量节点时，节点变化将大范围影响哈希环中的数据映射，因此这种方式不适合少量数据节点的分布式方案 
3. 普通的一致性哈希分区在增减分区节点时需要增加一倍或减去一半节点才能保证数据和负载的均衡 
3、虚拟槽分区 

    虚拟槽分区巧妙地使用了哈希空间，使用分散度良好的哈希函数把所有的数据映射到一个固定范围的整数集合中，整数定义为槽（slot）。这个范围一般远远大于节点数，比如Redis Cluster槽范围是0~16383。槽是集群内数据管理和迁移的基本单位。采用大范围槽的主要目的是为了方便数据才分和集群扩展。 

### 10.1.2 Redis数据分区 

    Redis虚拟槽分区的特点： 

* 解耦数据和节点之间的关系，简化了节点扩容和收缩难度 
* 节点自身维护槽的映射关系，不需要客户或者代理服务维护槽分区元数据 
* 支持节点、槽、键之间的映射查询，用于数据路由、在线伸缩等场景 

### 10.1.3 集群功能限制 

    Redis集群相对单机在功能上存在一些限制： 

1. key批量操作支持有限。如mset、mget，目前只支持具有相同slot值得key执行批量操作。对于映射为不同slot值得key由于执行mset、mget等操作可能存在于多个节点因此不被支持 
2. key事务操作支持有限。同理只支持多key在同一节点上的事务操作，当多个key分布在不同的节点上时无法使用事务功能 
3. key作为数据分区的最小粒度，因此不能将一个大的键值对象如hash、list等映射到不同的节点 
4. 不支持多数据库空间。单机下的Redis可以支持16个数据库，集群模式下只能使用一个数据库空间，即db 0 
5. 复制结构只支持一层，从节点只能复制主节点，不支持嵌套树状复制结构
 

## 10.2 搭建集群 

步骤：1、准备节点；2、节点握手；3、分配槽 

10.2.1 准备节点 

10.2.2 节点握手 

10.2.3 分配槽 

10.2.4 用redis-trib.rb搭建集群 

    redis-trib.rb是采用Ruby实现的Redis集群管理工具。内部通过Cluster相关命令帮我们简化集群创建、检查、槽迁移和均衡等常见运维操作，使用之前需要安装Ruby依赖环境。 

10.3 节点通信 

10.3.1 通信流程 

10.3.2 Gossip通信 

10.3.3 节点选择 

10.4 集群伸缩 

10.4.1 伸缩原理 

10.4.2 扩容集群 

10.4.3 收缩集群 

10.5 请求路由 

10.5.1 请求量定向 

10.5.2 Smart客户端 

10.6 故障转移 

10.6.1 故障发现 

    故障发现通过消息传播机制实现，主要环节包括：主管下线（pfail）和客观下线（fail） 

* 主观下线：指某个节点认为另一个节点不可用，即下线状态，这个状态并不是最终的故障判定，只能代表一个节点的意见，可能存在误判情况。 
* 客观下线：指标记一个节点真正的下线，集群内多个节点都认为该节点不可用，从而达成共识的结果。如果是持有槽的主节点故障，需要为该节点进行故障转移。 
10.6.2 故障恢复 

10.6.3 故障转移时间 

10.6.4 故障转移演练 

10.7 集群运维 

10.7.1 集群完整性 

10.7.2 带宽消耗 

10.7.3 Pub/Sub广播问题 

10.7.4 集群倾斜 

10.7.5 集群读写分离 

10.7.6 手动故障转移 

10.7.7 数据迁移 

# 11 缓存设计

## 11.1 缓存的收益和成本 

收益： 

* 加速读写 
* 降低后端复杂 

成本： 

* 数据不一致性：缓存层和数据层的数据存在着一定时间窗口的不一致性，时间窗口跟更新策略有关 
* 代码维护成本：加入缓存后，需要同时处理缓存层和存储层的逻辑，增大了开发者维护代码的成本 
* 运维成本：以Redis Cluster为例，加入后无形中增加了运维成本 

缓存的使用场景包括如下两种： 

* 开销大的复杂计算 
* 加速请求响应 

## 11.2 缓存更新策略 

1、LRU/LFU/FIFO算法剔除 

2、超时剔除 

3、主动更新 

4、最佳实践 

|策略 |一致性 |维护成本 |
|:----|:----|:----|
|LRU/LRF/FIFO算法剔除 |最差 |低 |
|超时剔除 |较差 |较低 |
|主动更新 |强 |高 |

## 11.3 缓存粒度控制 

    缓存全部属性还是缓存部分重要属性？从以下3个角度进行说明 

1、通用性 

    缓存全部数据比部分数据更加通用，但从实际经验看，很长时间内应用只需要几个重要的属性 

2、空间占用 

    缓存全部数据占用更多的空间，可能存在以下问题：1）内存的浪费；2）全部数据每次传输产生的网络流量会比较大，耗时相对较大，在极端情况下回阻塞网络；3）全部数据的序列化和反序列化的CPU开销大 

3、代码维护 

    全部数据的优势更加明显，而部分数据一旦要加新字段需要修改业务代码，而且修改后通常还需要刷新缓存数据 

## 11.4 穿透优化 

    缓存穿透是指查询一个根本不存在的数据，缓存层和存储层都不会命中，通常出于容错的考虑，如果从存储层查不到数据则不写入缓存层。步骤如下： 

1. 缓存层不命中 
2. 存储层不命中，不将结果写回缓存 
3. 返回空结果 
解决缓存穿透问题： 

1、缓存空对象 

问题：1）空值做了缓存，意味着缓存层存了更多的键，需要更多的内存空间（如果是攻击，问题更严重），比较有效的方法是针对这类数据设置一个较短的过期时间，让其自动剔除。2）缓存层和存储层的数据会有一段时间窗口的不一致，可能会对业务有一定影响。列如设置过期时间为5分钟，此时存储层添加了这个数据，那么会出现不一致情况，可以利用消息系统或其他方式清除掉缓存层中的空对象。 

2、布隆过滤器拦截 

    在访问缓存层和存储层之前，将存在的key用布隆过滤器提前保存起来，做第一层拦截。 

    这种方法适用于数据命中不高、数据相对固定、实时性低（通常是数据集较大）的应用场景，代码维护较为复杂，但是缓存空间占用少。 

2种方案对比 

|解决缓存穿透 |适用场景 |维护成本 |
|:----|:----|:----|
|缓存空对象 |1、数据命中不高 <br>2、数据频繁变化实时性高 |1、代码维护简单 <br>2、需要过多的缓存空间 <br>3、数据不一致<br><br> |
|布隆过滤器 |1、数据命中不高 <br>2、数据相对固定实时性低 |1、代码维护复杂 <br>2、缓存空间占用少<br><br> |

## 11.5 无底洞优化 

    “无底洞”现象：添加大量新Memcache节点，但是性能不但没有变好反而下降。 

无底洞现象分析： 

* 客户端一次批量操作会涉及多次网络操作，也就意味着批量操作会随着节点的增多、耗时会不断增大。 
* 网络连接数变多，对节点的性能也有一定影响。 

常见的IO优化思路： 

* 命令本身的优化，例如优化SQL语句等 
* 减少网络通信次数 
* 降低接入成本，例如客户端使用长连/连接池、NIO等 

4种分布式批量操作方案对比： 

|方案 |优点 |缺点 |网络IO |
|:----|:----|:----|:----|
|串行命令 |1）编程简单 <br>2）如果少量keys，性能可以满足要求 |大量keys请求延迟严重 |O(keys) |
|串行IO |1）编程简单 <br>2）少量节点，性能满足要求 |大量node延迟严重 |O(nodes) |
|并行IO |利用并行特性，延迟取决于最慢的节点 |1）编程复杂 <br>2）由于多线程，问题定威可能较差 |O(max_slow(nodes)) |
|hash_tag |性能最高 |1）业务维护成本较高 <br>2）容易出现数据倾斜 |O(1) |

## 11.6 雪崩优化 

    如果缓存层由于某些原因不能提供服务，所有的请求都会打到存储层呢刚，存储层的调用量会暴增，造成存储层也会级联宕机的情况。缓存雪崩（stampeding herd，奔逃的野牛）指的是缓存层宕掉后，流量就会像奔逃的野牛一样，打到后端存储。 

    预防和解决缓存雪崩问题，可以从以下三个方面进行着手。 

1）保证缓存层服务高可用性。 

2）依赖隔离组件为后端限流并降级。（Java依赖隔离工具：Hystrix） 

3）提前演练 

## 11.7 热点key重建优化 

    使用“缓存+过期时间”的策略既可以加速数据读写，又保证数据的定期更新，这种模式基本能够满足大部分需。但是如果同时出现以下2个问题，会对应用造成致命的伤害： 

* 当前key是一个热点key（例如一个热门的娱乐新闻），并发量非常大 
* 重建缓存不能再短时间完成，可能是一个复杂计算，例如复杂的SQL、多次IO、多个依赖等 

    要解决这个问题也不是很复杂，但是不能为了解决这个问题给系统带来更多的麻烦，所以需要制定如下目标： 

* 减少重建缓存的次数 
* 数据尽可能一致 
* 较少的潜在危险 

1、互斥锁（mutex key） 

    此方法只允许一个线程重建缓存，其他线程等待重建缓存的线程执行完，重新从缓存获取数据即可。 

2、永远不过期 

    包括两层意思： 

* 没有设置过期时间，所以不会出现热点key过期后产生的问题，也就是“物理”不过期。 
* 从功能层面来看，为每个value设置一个逻辑过期时间，当发现超过逻辑过期时间后，会使用单独的线程去构建缓存。 

|解决方案 |优点 |缺点 |
|:----|:----|:----|
|简单分布式锁 |1、思路简单 <br>2、保证一致性 |1、代码复杂度增大 <br>2、存在死锁的风险 <br>3、存在线程池阻塞的风险 |
|“永远不过期” |基本杜绝热点key问题 |1、不保证一致性 <br>2、逻辑过期时间增加代码维护成本和内存成本 |

# 12 开发运维的“陷进”

## 12.1 Linux配置优化 

### 12.1.1 内存分配控制 

1、vm.overcommit_memory 

    overcommit：Linux操作系统对大部分申请内存的请求都回复yes，以便能运行更多的程序。因为申请内存后，并不会马上使用内存，这种技术叫做overcommit。 

2、获取和设置 

```shell
获取
# cat /proc/sys/vm/overcommit_memory
0
 
设置
# echo “vm.overcommit_memory=1” >> /etc/sysctl.conf
sysctl vm.overcommit_memory=1 
```


3、最佳实践 

* Redis设置合理的maxmemory，保证机器有20%~30%的闲置内存 
* 集中化管理AOF重写和RDB的bgsave 
* 设置vm.overcommit_memory=1，防止极端情况下会造成fork失败
 

### 12.1.2 swappiness 

1、参数说明 

    swap：当物理内存不足时，可以将一部分内存进行swap操作，swap空间由硬盘提供，对于需要高并发、高吞吐的应用来说，磁盘IO通常成为系统瓶颈。在Linux中，并不是要等到所有物理内存都是用完才会使用swap，系统参数swappiness会决定操作系统使用swap的倾向程度。swappiness的取值范围是0~100，swappiness的值越大，说明操作系统可能使用swap的概率越高，swappiness值越低，表示操作系统更加倾向于使用物理内存。swap的默认值是60。 

    swappiness重要值策略说明： 

|值 |策略 |
|:----|:----|
|0 |Linux3.5以及以上：宁愿用OOM killer也不用swap |
|1 |Linux3.4以及以上：宁愿用swap也不用OOM killer |
|60 |默认值 |
|100 |操作系统会主动地使用swap |

OOM(Out of Memory) killer机制是指Linux操作系统发现可用内存不足时，强制杀死一些用户进程（非内核进程），来保证系统有足够的可用内存进行分配。 

2、设置方法 

echo {bestvalue} > /proc/sys/vm/swappiness    # 设置操作     # 重启系统后就会失效 

echo vm.swappiness={bestvalue} >> /etc/sysctl.conf    #追加操作 

3、如何监控swap 

（1）查看swap的总体情况 

    free命令查询操作系统的内存使用情况 

```shell
free -m(以兆为单位) 
```

（2）实时查看swap的使用 

    vmstat命令查询系统的相关性能指标，其中包括负载、CPU、内存、swap、IO的相关属性。但其中和swap有关的指标是si和so，分别代表操作系统的swap in和swap out。 

```shell
vmstat 1(每隔1秒输出) 
```

（3）查看指定进程的swap使用情况 

    /proc/{pid}目录是存储指定进程的相关信息，其中/proc/{pid}/smaps记录了当前进程所对应的内存映像信息，这个信息对于查询指定进程的swap使用情况很有帮助。

```shell
# 通过info server 获取Redis的进程号process_id
# redis-cli -h ip -p port info server | grep process_id
process_id:986
 
cat /proc/986/smaps  # 会输出多个内存块信息
cat /proc/986/smaps | grep Swap    # 单独输出每个内存块镜像信息中这个进程用到的swap量 
```

### 12.1.3 THP 

    Transparent Huge Pages（THP）：Linux kernel在2.6.38内核增加了THP特性，支持大内存页（2MB）分配，默认开启。当开启时可以加快fork子进程的速度，但fork操作之后，每个内存页从原来4KB变为2MB，会大幅增加重写期间父进程内存消耗。同时每次写命令引起的复制内存页单位放大了512倍，会拖慢写操作的执行时间，导致大量写操作慢查询，例如简单的incr命令也会出现在慢查询中。因此Redis日志中建议将此特性进行禁用，方法如下： 

```shell
echo never > /sys/kernel/mm/transparent_hugepage/enabled # 注意有的OS路径不一致 
```

### 12.1.4 OOM killer 

    OOM killer会在可用内存不足时选择性地杀掉用户进程。运行规则：OOM killer进程会为每个用户进程设置一个权值，这个权值越高，被“下手”的概率就越高，反之概率越低。每个进程的权值存放在/proc/{progress_id}/oom_score中，这个值受/proc/{progress_id}/oom_adj的控制，oom_adj在不同的Linux版本中最小值不同。当oom_adj设置为最小值时，该进程将不会被OOM killer杀掉，设置方法如下。 

```shell
echo {value} > /proc/${process_id}/oom_adj 
```

    对于Redis所在的服务器来说，可以将所有Redis的oom_adj设置为最低值或者稍小的值，降低被OOM killer杀掉的概率。 

```shell
for redis_pid in $(pgrep -f “redis-server”)
do 
    echo -17 > /proc/${redis_pid}/oom_adj
done
```

### 12.1.5 使用NTP 

    NTP（Network Time Protocol，网络时间协议）是一种保证不同机器时钟一致性的服务。 

例如每小时的同步1次NTP服务：

```shell
0 **** /usr/sbin/ntpdate ntp.xx.com > /dev/null 2>&1 
```

### 12.1.6 ulimit 

    在Linux中，可以通过ulimit查看和设置系统当前用户进程的资源数。其中ulimit -a命令包含的open files参数，是单个用户同时打开的最大文件个数：

```shell
# ulimit -a 
```

### 12.1.7 TCP backlog 

    Redis默认的tcp-backlog值为511，可以通过修改配置tcp-backlog进行调整。 

查看方法：

```shell
# cat /proc/sys/net/core/somaxconn
128
```
修改方法：
```shell
echo 511 > /proc/sys/net/core/somaxconn 
```

## 12.2 flushall/flushdb误操作 

    Redis的flushall/flushdb命令可以做数据清除。 

### 12.2.1 缓存与存储 

    Redis可以做缓存或者存储，被误操作flush后，使用策略有所不同。 

### 12.2.2 借助AOF机制恢复 

    执行flush之后，提示如下所示： 

（1）appendonly no：对AOF持久化没有任何影响，因为不存在AOF文件 

（2）appendonly yes：只不过在AOF文件中追加了一条记录。如： 

```shell
*1
$8
flushall 
```

虽然Redis中的数据被清除掉了，但是AOF文件还保存着flush操作之前完整的数据，对恢复数据还是很有帮助的，但注意问题如下： 

1）如果发生了AOF重写，Redis遍历所有数据库重新生成AOF文件，并会覆盖之前的AOF文件。所有如果AOF重写发生了，也就意味着之前的数据就丢掉了，那么利用AOF文件来恢复的办法就失效了。所以当误操作后，需要考虑如下两件事： 

* 调大AOF重写参数auto-aof-rewrite-percentage和auto-aof-rewrite-min-size，让Redis不能产生AOF自动重写。 
* 拒绝手动bgrewriteaof 

2）如果要用AOF文件进行数据恢复，那么必须要将AOF文件中的flushall相关操作去掉，为了更加安全，可以在去掉之后使用redis-check-aof这个工具去检验和修复一下AOF文件，确保AOF文件格式正确，保证数据恢复正常。 

### 12.2.3 RDB有什么变化 

    Redis执行了flushall操作后，RDB持久化文件会受到什么影响呢？ 

1）如果没有开启RDB的自动策略，也就是配置文件中没有如下类似配置：

```plain
save 900 1
save 300 10
save 60 10000 
```

那么除非手动执行过save、bgsave或者发生了主从的全量复制，否则RDB文件也会保存flush操作之前的数据，可以作为恢复数据的数据源。注意问题如下： 

* 防止手动执行save、bgsave，如果此时执行save、bgsave，新的RDB文件就不会包含flush操作之前的数据，被老的RDB文件进行覆盖。 
* RDB文件中的数据可能没有AOF实时性高，也就是说，RDB文件很可能很久之前主从全量复制生成的，或者之前用save、bgsave备份的。
 

2）如果开启了RDB的自动策略，由于flush涉及键值数量较多，RDB文件会被清除，意味着使用RDB恢复基本无望。 

综上，如果AOF已经开启，那么用AOF来恢复比较合理，如果AOF关闭，那么RDB虽然数据不是很实时，但是也能恢复部分数据，完全取决于RDB是什么时候备份的。（RDB的恢复速度比AOF快很多，但总体来说对于flush操作之后不是最好的恢复数据源） 

### 12.2.4 从节点有什么变化 

    Redis从节点同步了主节点的flush命令，所以从节点的数据也是被清除了，从节点的RDB与AOF的变化与主节点没有任何区别。 

### 12.2.5 快速恢复数据 

    下面使用AOF作为数据源进行恢复演练 

    1）防止AOF重写。快速修改Redis主从的auto-aof-rewrite-percentage和auto-aof-rewrite-min-size变为一个很大的值，从而防止了AOF重写的发生。 

```shell
config set auto-aof-rewrite-percentage 1000
config set auto-aof-rewrite-min-size 10000000000 (11个0，大就完事了） 
```

    2）去掉主从AOF文件中的flush相关内容 

```shell
*1
&8
flushall 
```

    3）重启Redis主节点服务器，恢复数据 

## 12.3 安全的Redis 

    被攻击Redis的特点： 

* Redis所在机器有外网IP 
* Redis以默认端口6379为启动端口，并且是对外网开放的 
* Redis是以root用户启动的 
* Redis没有设置密码 
* Redis的bind设置为0.0.0.0或者“” 

### 12.3.1 Redis密码机制 

### 12.3.2 伪装危险命令 

1、引入rename-command 

2、没有免费的午餐 

* 管理员有一定的开发和维护成本，都需要使用重命名之后的命令 
* rename-command配置不支持config set，所以在启动前一定要确定哪些命令需要使用rename-command 
* 如果AOF和RDB文件包含了rename-command之前的命令，Redis将无法启动，因为此时它识别不了rename-command之前的命令 
* Redis源码中一些命令是写死的，rename-command可能造成Redis无法正常工作，例如config命令。 

3、最佳实践 

* 对于危险的命令，无论内网外网，一律使用rename-command配置 
* 建议第一次配置Redis时，就应该配置rename-command，因为rename-command不支持config set 
* 如果涉及主从关系，一定要保持主从节点配置的一致性，否则存在主从数据不一致的可能性
 

### 12.3.3 防火墙 

    限制输入和输出的IP或者IP范围、端口或者端口范围。（必杀技） 

### 12.3.4 bind 

1、对于bind的错误认识 

    bind指定的是Redis和哪个网卡进行绑定，和客户端是什么网段没有关系。 

2、建议 

* 如果机器有外网IP，但部署的Redis是给内部使用，建议去掉外网网卡或者使用bind配置限制流量从外网进入 
* 如果客户端和Redis部署在一台机器上，可以使用回环地址 
* bind配置不支持config set，所以尽可能在第一次启动前配置好 

### 12.3.5 定期备份数据 

### 12.3.6 不适用默认端口 

    Redis的默认端口是6379 

### 12.3.7 使用非root用户启动 

## 12.4 处理bigkey 

### 12.4.1 bigkey的危害 

* 内存空间不均匀 
* 超时阻塞 
* 网络拥塞
 

### 12.4.2 如何发现 

```shell
redis-cli —bigkeys
debug object key
strlen key 
```

在实际生产环境中发现bigkey的两种方式如下： 

* 被动收集（开发人员日志key） 
* 主动监测 

### 12.4.3 如何删除 

## 12.5 寻找热点key 

1、客户端 

    使用map<key, count>记录，如在connection类中的sendCommand方法是所有命令执行的枢纽 

* 无法预知key的个数 
* 对于客户端代码有侵入 
* 只能了解当前客户端的热点key，无法实现规模化运维统计 

    除了使用本地字典计数外，还可以使用其他存储来完成异步计数 

2、代理端 

3、Redis代理端 

4、机器 

    可以通过对机器上所有Redis端口的TCP数据包进行抓取完成热点key的统计 

寻找热点key的四种方案 

|方案 |优点 |缺点 |
|:----|:----|:----|
|客户端 |实现简单 |1、内存泄露隐患 <br>2、维护成本高 <br>3、只能统计单个客户端 |
|代理 |代理是客户端和服务端的桥梁，实现最方便最系统 |增加代理端的开发部署成本 |
|服务端 |实现简单 |1、Monitor本身的使用成本和危害，只能短时间使用 <br>2、只能统计单个Redis节点 |
|机器 |对于客户端和服务端无侵入和影响 |需要专业的运维团队开发，并且增加了机器的部署成本 |


13 Redis监控运维云平台CacheCloud

13.1 CacheCloud是什么 

13.2 快速部署 

13.3 机器部署 

13.4 接入应用 

13.5 用户功能 

13.6 运维功能 

13.7 客户端上报 

2020年01月11日（周六）完 

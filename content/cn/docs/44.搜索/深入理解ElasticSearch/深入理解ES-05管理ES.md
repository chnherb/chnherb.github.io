---
categories: ["ES"]
tags: [""]
title: "深入理解ES-05管理ES"
# linkTitle: ""
weight: 10
description: >

---

本章将会学习：

* 如何选择正确的目录实现，使得 ES 能够以高效的方式访问底层 I/O 系统
* 如何配置发现模块来避免潜在的问题
* 如何配置网关模块以适应需求
* 恢复模块能带来什么，以及如何更改它的配置
* 如何查看段信息
* ES 的缓存是什么样的，职责是什么，如何使用以及更改它的配置
## 选择正确的目录实现-存储模块

存储模块非常重要，该模块允许用户控制索引的存储方式。如可以持久化存储（存储在磁盘上）或非持久化存储（存储在内存中）。ES 的大多数存储类型与 Apache Lucene 中 Directory 类的子类是一一对应的。而目录能存取构成索引的各种文件，因此对其做适当的配置也是至关重要的。

### 存储类型

ES 提供了 4 种可用的存储类型。

#### 简单文件系统存储

最简单的目录类的实现，使用一个随机读写文件（Java RandomAccessFile: [http://docs.oracle.com/javase/7/docs/api/java/io/RandomAccessFile.html](http://docs.oracle.com/javase/7/docs/api/java/io/RandomAccessFile.html) ）进行文件操作，并与 Apache Lucene 的 SimpleFSDirectory 类对应（[http://lucene.apache.org/core/4_5_0/core/org/apache/lucene/store/SimpleFSDDirectory.html](http://lucene.apache.org/core/4_5_0/core/org/apache/lucene/store/SimpleFSDDirectory.html) ）。对于简单的应用来说是够用的，但瓶颈主要是在多线程访问上，即性能非常差。对于 ES 来说，最好使用基于新 I/O 的系统存储来代替简单文件系统存储。然后，如果确实需要使用这种存储类型，则需要将 index.store.type 属性设为 simplefs。

#### 新I/O文件系统存储

该存储类型使用基于 java.nio.FileChannel（[http://docs.oracle.com/javase/7/docs/api/java/nio/channels/FileChannel.html](http://docs.oracle.com/javase/7/docs/api/java/nio/channels/FileChannel.html) ）的目录实现，与 Apache Lucene 的 NIOFSDirectory 类对应。该实现允许多个线程在不降低性能的前提下访问同一个文件。如果想使用这个存储类型，需要将 index.store.type 属性设为 niofs。

#### MMap文件系统存储

该存储类型使用了 Apache Lucene 的 MMapDirectory 实现。它使用 mmap 系统命令来读取和随机写入文件，并从进程的虚拟地址空间的可用部分中分出与被映射文件大小相同的空间，用于装载被映射文件。它没有任何锁机制，非常适合多线程访问。当使用 mmap 来为操作系统读取索引时就像它已经缓存过了一样（它被映射到了虚拟地址空间）。当从 Lucene 索引中读取某文件时，不需要把文件载入操作系统的缓存中，因此访问速度更快。基本上允许 Lucene 和 ES 去直接访问 I/O 缓存，从而获得了更快的索引文件访问速度。

需要注意，MMap 文件系统存储在 64 位环境下工作最佳，对于 32 位系统，只有确信索引足够小，且虚拟地址空间足够大时才可以使用。要使用此存储类型，需要将 index.store.type 属性设为 mmapfs。

#### 内存存储

内存存储时唯一一个不是基于 Apache Lucene 目录的存储类型，它允许把全部索引都保存在内存中，因此文件并没有存储在硬盘上。这点很关键，意味着索引数据是非持久化的，无论何时，只要集群彻底重启索引数据就会被删除。然而，如果需要一份非常快的小索引，拥有多个分片和副本，且可以快速重建，那么内存存储可以作为你的选择。使用该存储类型，需要将 index.store.type 属性设为 memory。

>内存存储中的数据与其它存储类型中的数据一样，会被复制到所有能容纳数据的节点上去。

#### 附加属性

当使用内存存储类型时，也能一定程度上控制缓存，这点非常重要。注意以下设置都是节点级别的：

* cache.memory.direct：定义内存存储是否应该被分配到 Java 虚拟机堆内存之外，默认为 true。一般情况下应该保持为默认值，从而能避免堆内存过载。
* cache.memory.small_buffer_size：定义小缓冲区的大小，默认值是 1KB。小缓冲区是用来容纳段（segment）信息和已删除文档信息的内部内存结构。
* cache.memory.large_buffer_size：定义大缓冲区的大小，默认值是 1MB。大缓冲区是用来容纳出段信息和已删除文档信息外的索引文件的内部内存结构。
* cache.memory.small_cache_size：定义小缓存的大小，默认值是 10MB。小缓存是用来缓存段信息和已删除文档信息的内部内存结构。
* cache.memory.large_cache_size：定义大缓存的大小，默认值是 500MB。大缓存是用来缓存除段信息和已删除文档信息外的索引文件的内部内存结构。
#### 默认存储类型

ES 默认使用基于文件系统的存储类型。针对不同的操作系统往往会选择不同的存储类型，但终究都使用了基于文件系统的存储类型。例如，ES 在 32 位的 Windows 系统上使用 simplefs 类型，在 Solaris 和 64 位的 Windows 系统上使用 mmapfs，其它系统则使用 niofs。

>如果你想了解一些关于如何选择目录实现的专家见解， 请查看 Uwe Schindler 发表的
>博文 [http://blog.thetaphi.de/2012/07/use-lucenes-mmapdirectory-on-64bit.html](http://blog.thetaphi.de/2012/07/use-lucenes-mmapdirectory-on-64bit.html) ，以及 Jorg Prante 发表的博文 [http://jprante.github.io/applications/2012/07/26/Mmap-with-Lucene.html](http://jprante.github.io/applications/2012/07/26/Mmap-with-Lucene.html) 。

通常，默认的存储类型就是想使用的那个，但有时候需要使用 MMap 文件系统存储类型，尤其当有用很多内存，且索引又很大的时候。因为当使用 mmap 来访问索引文件时，索引文件只会被缓存一次，且可以被 Lucene 和操作系统重复使用。

## 发现模块的配置

ES 就是为集群而设计的，这是 ES 跟其它类似的开源解决方案的最大不同。通过发现机制（discovery mechanism）ES 极大地简化了设置集群所需的工作。

定义了想通 cluster.name 的节点会自动组成集群，这让我们可以在相同的网络中拥有多个独立的集群，但缺点是有时会忘记修改配置而意外地加入到了其它集群。这种情况下 ES 会重新平衡集群，转移一些数据到新加入的节点上。当该节点关机时，集群中的一些数据可能会魔术般地消失掉。

### Zen发现

Zen发现（Zen discovery）是ES自带的默认发现机制。Zen发现默认使用多播来发现其它节点。这种解决方案非常快捷，一切顺利的话只要启动一个新的 ES 节点，并给它设置与集群相同的名字，它就会加入到集群中，并被其它节点探测出来。如果出现问题，应该检查 publish_host 或 host 设置，确保 ES 监听了正确的网络接口。

有时候多播会由于各种原因而失效，或者在一个大型集群中使用多播发现会产生大量不必要的流量，这可能都是不想使用多播的合理理由。这些情况下，Zen发现使用了第二种发现方法：单播模式。下面描述下这些模式的具体配置：

#### 多播

多播（multicast）是ES的默认模式。当节点还没有加入任何集群时（如节点刚刚启动或重启），它会发出一个多播的 ping 请求，相当于通知所有可见的节点和集群，它已经可用并准备好加入集群了。

Zen发现模块的多播部分有如下配置：

* discovery.zen.ping.multicast.address：通信接口，可复制为地址或接口名。默认值是所有可用接口。
* discovery.zen.ping.multicast.port：通信端口，默认为 54328。
* discovery.zen.ping.multicast.group：代表发送多播信息的地址，默认为 224.2.2.4。
* discovery.zen.ping.multicast.buffer_size：缓冲区大小，默认为 2048。
* discovery.zen.ping.multicast.ttl：定义多播消息的生存期，默认为 3。每次包通过路由时，TTL 就会递减。这样可以限制广播接收的访问。注意，路由数的阈值设置可参考 TTL 的值，但要确保 TTL 的值不能恰好等于数据包经过的路由数。
* discovery.zen.ping.multicast.enabled：默认 true。如果打算使用单播方式二需要关闭多播时，可设置为 false。
#### 单播

当节点不是集群中的一部分时（如刚刚重启，启动或由于某些故障脱离集群），它会发送一个 ping 请求给配置文件所指定的那些地址，通知所有的节点它准备好要加入集群了。

单播的配置非常简单，如下所示：

* discovery.zen.ping.unictas.hosts：代表集群中的初始化节点列表，可称之为一个列表或主机数组。每个主机可指定一个名称（或IP地址），还可以追加一个端口或端口范围。例如，属性值可以是：["master1", "master2:8181", "master3[80000-81000]"]。一般来说，单播发现的主机列表不需要是集群中所有ES节点的完整列表，因为新节点一旦与列表中的任何一个节点相连，就会知晓组成集群的其它全部节点的信息。
* discovery.zen.ping.unictas.concurrent_connects：定义单播发现使用的最大并发连接数。默认 10 个。
#### 最小主节点数

对发现模块来说一个最重要的属性是 discovery.zen.minimum_master_nodes 属性。它允许设置构建集群所需的最小主节点（master node）候选节点数。这让我们避免了由于某些错误（如网络问题）而出现令人头疼的局面（即多个集群同名）。建议使用 discovery.zen.minimum_master_nodes 属性并设置为大于等于集群节点数的一半加 1。

#### Zen发现错误检测

ES 在工作中执行两个检测流程。第一个流程是由主节点向集群中其它节点发送 ping 请求来检测它们是否工作正常。第二个流程刚好相反，由每个节点向主节点发送请求来验证主节点是否正在运行并能履行其职责。然后由于网络速度很慢，或者节点部署在不同的地点，那么默认的配置也许就不合适了。因此 ES 的发现模块提供了一下可以修改的配置：

* discovery.zen.fd.ping_interval：设置节点向目标节点发送 ping 请求的频率，默认 1 秒。
* discovery.zen.fd.ping_timeout：设置节点等待 ping 请求响应的时长，默认 30 秒。如果节点使用率达到100%或者网速很慢，可以考虑增大该属性值。
* discovery.zen.fd.ping_retries：设置当目标节点被认为不可用之前 ping 请求的重试次数，默认为 3 次。如果网络丢包比较严重，可以考虑增大该属性值，或者修复网络。
### 亚马逊EC2发现

亚马逊商店除了交易商品外，还销售一些流行的服务，例如使用按量计费的模式销售存储空间或计算能力。这被称为 EC2 模式，亚马逊提供服务器实例，可以用来安装和使用 ES 集群（也可以安装其他许多东西，因为它们就相当于普通的 linux 服务器）。ES可以在 EC2 上工作，但由于环境的特性，一些功能在工作时会有所不同。其中之一就是发现模块，因为亚马逊 EC2 不支持多播发现。当然在单播模式下能正常工作，但失去了自动检测节点的能力，且在多数情况下不想失去这个功能。幸运的是还有一个替代方案：可以使用亚马逊 EC2 插件，即一个通过使用亚马逊 EC2 接口整合多播和单播发现的插件。

>确保设置 EC2 实例时，开启了实例间的通讯（默认端口 9200 和 9300）。这对 ES 通讯和集群能正常工作至关重要。当然通讯设置依赖于 network.bind_host 和 network.publish_host（或 network.host）的配置。

#### EC2插件安装

同大多数插件一样，EC2插件的安装十分简单。安装时执行下面的命令：

```shell
bin/plugin install cloud-aws
```

**EC2插件的配置**

为了使EC2发现能正常工作，需要对插件的以下属性进行配置：

* cluster.aws.access_key：亚马逊访问key，凭据值之一，可以在亚马逊配置面板中找到。
* cluster.aws.secret_key：亚马逊安全key，同 access_key 一样，可以在亚马逊 EC2 的配置面板中找到。
最后一件事是通知ES将要使用新的发现模式。可以通过关闭多播，并设置 discovery.type 属性值为 ec2 来实现。

**可选的EC2发现配置**

前面提到的设置已经足够运行EC2发现，但为了控制EC2发现插件的行为，ES还提供了一下配置项：

* cloud.aws.region：指定连接亚马逊web服务的趋于（region）。可以选择一个适合的实例所在区域。例如，爱尔兰可以选择eu-west-1。可选的区域有：eu-west-1、us-east-1、us-west-1 和 ap-southeast-1。
* cloud.aws.ec2.endpoint：不同于前面提到的设置指定区域，该属性设置得是一个 AWS 端点地址。如 ec2.eu-west-1.amazonaws.com。
* cloud.ec2.ping_timeout：确定当发送 ping 消息给一个节点时，响应的最长时间，默认为 3 秒。超过这个时间，没有响应的节点会被认为是已经宕机，并从集群中移除。在网络有问题或有很多 ec2 节点时可以增大这个值。
**EC2节点扫描配置**

该设置允许配置 EC2 集群构建过程中的一件非常重要的事情：在亚马逊网络上过滤可用 ES 节点的能力。ES EC2 插件提供了以下相关属性：

* discovery.ec2.host_type：指定了与集群中其它节点通信时使用的主机类型。可用选项有：private_ip（默认值，私有IP将被用来进行通信）、public_ip（公有IP将被用来进行通信）、private_dns（私有主机名将被用来进行通信）和 public_dns（公有主机名将被用来进行通信）
* discovery.ec2.tag：定义了一组设置。当启动亚马逊 EC2 实例时，可以定义描述该实例用途的标签，如客户名或环境类别，可以用这个标签来限制所发现的节点。如定义了一个名为 environment 的标签并赋值为 qa，配置时可以指定 discovery.ec2.tag.environment: qa。因而只有带着这个标签的实力上的节点才会被发现机制考虑。
* discovery.ec2.groups：定义了一个安全组列表。只有安全组内的节点才会被发现并加入到集群中。
* discovery.ec2.availability_zones：定义了一个可用地区列表。只有属于指定可用地区的节点才会被发现并加入到集群中。
* discovery.ec2.any_group：默认 true。设置为 false 会强制 EC2 发现插件只发现那些驻留在预定义好的安全组内的亚马逊实例上的ES节点。默认值只要求匹配一个组。
* cloud.node.auto_attributes：设为 true 时，上面的信息都能在配置分片部署时作为属性。
#### 网关和恢复的配置

网关模块允许存储所欲 ES 正常工作时所需的数据。这意味着不仅存储了 Apache Lucene 的索引文件，还存储了所有的元数据（如索引的分配设置），以及每个索引的映射（mapping）信息。无论何时集群的状态发生了改变，例如当分配属性改变时，集群的状态就会通过网关模块被持久化。当集群启动时，之前保存的状态信息就会加载，并有网关模块使用。

>注意在配置不同的节点和网关类型时，索引将使用所在节点所配置的那种网关类型。如果索引状态信息不应通过网关模块存储，需要显式设置索引网关类型为 none。

**恢复的过程**

恢复过程是 ES 为了正常运行而加载通过网关模块存储的数据的过程。无论何时，只要集群完全重启网关进程就开始生效，进而加载所有前面提到的那些相关信息：元数据、映射以及所有的索引。在分片恢复期间，ES在节点间拷贝数据，这些数据同样是 Lucene 索引、元数据和事务日志（用来恢复尚未索引的文档）。

ES允许配置应当何时通过网关模块来恢复实际的数据、元数据和映射。例如，在开始恢复过程前，需要等待集群拥有了一定数量的候选主节点或数据节点。注意，在恢复过程结束前，集群上执行的任何操作都是禁止的。这样是为了避免出现修改冲突。

**可配置的属性**

ES节点可以扮演不同的角色，可以作为数据节点（存储数据的节点），也可以作为主节点，其中主节点（一个集群中只有一个）除了处理查询请求外，还负责集群管理。当然节点也可以配置为既不是主节点也不是数据节点。这种情形下，该节点只作为执行用户查询的聚合节点。ES默认每个节点都是数据节点和候选主节点，但可以修改。取消某节点的主节点候选资格，在 elasticsearch.yml 文件中将 node.master 属性设为 false。让某节点成为非数据节点，在 elasticsearch.yml 文件中将 node.data 属性设为 false。

除此之外，还允许使用以下属性来控制网关模块的行为：

* gateway.recover_after_nodes：整数类型，表示要启动恢复过程集群中所需的节点数。如，属性值为 5 时，如果要启动恢复过程，集群中就至少要有 5 个节点（无论是候选主节点还是数据节点）存在。
* gateway.recover_after_data_nodes：允许设置当恢复过程启动时，集群中需要存在的数据节点数。
* gateway.recover_after_master_nodes：允许设置当恢复过程启动时，集群中需要存在的候选主节点数。
* gateway.recover_after_time：允许设置在条件满足后，启动恢复过程前需要等待的时间。
**节点预期**

还可以配置以下属性，从而可以强制启动恢复过程：

* gateway.expected_nodes：指定立即启动恢复过程需要集群中存在的节点数。如果不希望恢复过程被延迟，建议设置属性值为将用于构建集群的节点数（或者至少要接近这个数），因为这会保证最新的集群状态得到恢复。
* gateway.expected_data_nodes：指定了立即启动恢复过程需要集群中存在的数据节点数。
* gateway.expected_master_nodes：指定了立即启动恢复过程需要集群中存在的候选主节点数。
### 本地网关

随着 ES 0.20 版（以及 0.19 的某些版本）的发布，除了默认的本地类型，其它类型的网关都已弃用，并建议不再使用，因为在新版的 ES 中都会被移除。如果要避免重新索引全部数据，应该使用本地网关类型。

本地网关类型使用节点上可用的本地存储来保存元数据、映射和索引。为了使用本地网关，需要有充足的磁盘空间来容纳数据（数据全部写入磁盘，而非保存在内存缓存中）。

本地网关的持久化不同于其它当前存在（但是已经弃用）的网关类型。向本地网关的写操作是以同步的方式进行的，以确保在写入过程中没有数据丢失。

>为了设置想要使用的网关类型，需要使用 gateway.type 属性，默认为 local。

#### 备份本地网关

ES 0.90.5 及其之前版本不支持本地网关存储数据的自动备份。然而有时备份是有必要的，例如升级集群时，希望出错后可以回滚。为了实现这个目的，需要执行下面的操作：

* 停止向 ES 集群索引数据（意味着停止 river 或其它向 ES 发送数据的外部应用）
* 使用清空（Flush）API 清空所有尚未索引的数据
* 为分配在集群中的每个分片创建至少一个备份，至少可以保证一旦发生问题能找回数据。如果希望操作尽可能简单，可以拷贝集群中每个数据节点上的完整数据目录。
### 恢复配置

除了前面提到的可以使用网关类配置 ES 恢复过程的行为，但是除此之外，ES 还允许配置回复过程本身。分片分配时已经提到了一些恢复配置选项。

#### 集群级的恢复配置

恢复配置大多针对的是集群级别，允许设置恢复模块使用的通用规则，可设置一下属性：

* indices.recovery_concurrent_streams：制定了从分片源回复分片时允许打开的并发流的数量，默认是 3。较大的值会给网络层带来更大的压力，但恢复过程会更快，这依赖于网络的使用情况和吞吐量。
* indices.recovery.max_bytes_per_sec：制定了在分片恢复过程中每秒传输数据的最大值，默认是 20MB。如果想取消数据传输限制，需要把这个属性设为 0。与并发流属性类似，该属性允许控制恢复过程中网络的使用。把它设为较大的值会带来较高的网络利用率，而且恢复过程会更快。
* indices.recovery.compress：默认值为 true，用来指定 ES 是否在恢复过程汇总压缩传输的数据。设为 false 可以降低 CPU 的压力，但同样会导致更多的网络数据传输。
* indices.recovery.file_chunk_size：指定从源分片向目标分片拷贝数据时数据块（chunk）的大小。默认值为 512KB，而如果将 indices.recovery.compress 属性设为 true 该值也会被压缩。
* indices.recovery.translog_ops：默认值为 1000，指定在恢复过程中分片间传输数据时，单个请求里最多可以传输多少行事务日志。
* indices.recovery.translog_size：指定从源分片拷贝事务日志时使用的数据块的大小。默认值为 512KB，且如果 indices.recovery.compress 属性设为 true，该值还会被压缩。
>ES 0.90.0 以上的版本，indices.recovery.max_size_per_sec 属性可以使用，但是已经被弃用，现在建议使用 indices.recovery.max_bytes_per_sec 属性来代替。

所有提到过的设置都可以通过集群的更新 API 来更新，或者在 elasticsearch.yml 文件里设置。

#### 索引级的恢复配置

还有一个可以在索引级设置得属性，即 index.recovery.initial_shards 属性，既可以在 elasticsearch.yml 文件里设置，也可以通过索引更新 API 设置。通常 ES 只有在特定数量的分片存在且能被分配时才会恢复一个特定的分片。该特定数量等于指定索引的分片数的 50% 加 1。通过 index.recovery.initial_shards 属性，可以改变 ES 的“特定数量”。该属性可以取以下值：

* quorum：这个值暗示需要总分片数 *50% 加 1 个分片存在且可分配。
* quorum-1：这个值暗示对于给定索引，需要总分片数 *50% 个分片存在且可以分配。
* full：这个值暗示对于给定索引，需要所有分片存在且可分配。
* full-1：这个值暗示对于给定索引，需要总分片数减 1 个分片存在且可分配。
* 整数值：这个值为任意整数，如1、2、5，代表需要存在且可分配的分片数量。例如，该值为 2 表示需要至少 2 个分片存在且可分配。
大多数情况下默认值对于部署来说已经够用了。

## 索引段统计

### segments API简介

为了深入观察 Lucene 索引段，ES提供了 segments API，可以通过向 _segments REST 端点发送 HTTP GET 请求来访问它。例如，查看集群中所有索引的所有段信息，应当执行下面的命令：

```shell
curl -XGET 'localhost:9200/_segments'
```
如果只想查看 mastering 索引的段信息，应当执行下面的命令：
```shell
curl -XGET 'localhost:9200/mastering/_segments'
```
也可以同时看多个索引的段，只需执行下面的命令即可：
```shell
curl -XGET 'localhost:9200/mastering,books/_segments'
```

#### segments API响应

segments API 调用的响应总是面向分片的，这是由于索引是由一个或多个分片（以及它们的副本）构成，每个分片就是一个物理上的 Lucene 索引。

假设有一个名为 mastering 的索引，并且里面已经索引了一些文档。创建索引时指定索引中只有一个分片且没有任何副本。

查看索引段：

```shell
curl -XGET 'localhost:9200/_segments?pretty'
```
ES会返回大量可供分析的有用信息。
索引段列表每个段由下面的属性来表征：

* number：段编号，也是 JSON 对象名，所有其它的段相关信息都包含在该 JSON 对象里面（如 _0、_1 等）。
* generation：代表索引的代（generation），即一个告诉索引段由多“老”的字段。例如，代为 0 的索引段表示是最初创建的。
* num_docs：代表索引段内的文档数。
* deleted_docs：代表被标记为已删除的文档数，这些文档会在索引段合并过程中被删除。
* size：代表索引段在磁盘上的大小。
* size_in_bytes：代表索引段以字节为单位的大小。
* committed：true表示索引段已提交，反之没提交。
* search：表示索引段是否可以被 ES 搜索。
* version：代表该 Lucene 索引的版本号。注意：尽管一个给定版本的 ES 只使用一个 Lucene 版本，但也会出现不同索引段由不同版本的 Lucene 创建的情况。因而在升级 ES 时，新版 ES 可能刚好使用了不同版本的 Lucene。这种情况下，比较老的索引段在向新版合并时会被重写。
* compound：代表索引段时符合文件格式存储的（用单个文件存储改索引段的所有索引文件）
### 索引段信息的可视化

一个名为 SegmentSpy 的插件（[https://github.com/polyfractal/elasticsearch-segmentspy](https://github.com/polyfractal/elasticsearch-segmentspy) ）可以做 segments API 的可视化展示。

安装插件后，把浏览器只想 [http://localhost:9200/_plugin/segmentspy/](http://localhost:9200/_plugin/segmentspy/) ，并选择感兴趣的索引，会看到 segments 信息。

## 理解ES缓存

缓存在ES里扮演着重要角色，允许有效地存储过滤器并重用它们，使用父子功能、使用切面、以及基于索引字段的高效排序。

### 过滤器缓存

过滤器缓存是负责缓存查询中使用的过滤器的执行结果的。例如，下面这个查询：

```json
{
  "query": {
    "filtered": {
      "query": {
        "match_all": {}
      },
      "filter": {
        "term": {
          "category": "romance"
        }
      }
    }
  }
}
```
该查询会返回所有在 category 字段中包含 romance 词项的文档。可一个看到使用了 match_all 查询和一个过滤器。在该查询第一次执行以后，每个与该查询相同过滤的查询都会重用其结果，节省了宝贵的 I/O 和 CPU 资源。
#### 过滤器缓存的种类

ES 中有两种类型的过滤器缓存：索引级和节点级，即可以选择配置索引级或节点级（默认选项）的过滤器缓存。由于不一定能预知给定索引会分配到哪里（实际上指索引的分片和副本），进而无法预测内存的使用，所以不建议使用索引级的过滤器缓存。

#### 索引级过滤器缓存的配置

ES允许使用下面的属性配置索引级过滤器缓存的行为：

* index.cache.filter.type：设置缓存的类型，可以使用 resident、soft、weak 或 node（默认值）。在 resident 缓存中的记录不能被 JVM 移除，除非想移除它们（通过使用 API，设置最大缓存值，或者设置过期时间），并且也是因为这个原因而推荐使用它（填充过滤器缓存代价很高）。内存吃紧时，JVM 可以清除 soft 和 weak 类型的缓存，区别是在清理内存时，JVM 会优先清除 weak 引用对象，然后才是 soft 引用对象。最后的 node 属性代表缓存将在节点级控制。
* index.cache.filter.max_size：指定能存储到缓存中的最大记录数（默认是 -1，代表无限制）。需要注意这个设置不是应用在整个索引上，而是应用于指定索引的某个分片的某个索引段上，所以内存的使用量会因索引的分片数和副本数以及索引中段数的不同而不同。通常来说，结合 soft 类型使用默认无限制的过滤器缓存就足够了。谨记慎用某些查询以保证缓存的可重用性。
* index.cache.filter.expire：指定过滤器缓存中记录的过期时间，默认是 -1，代表永不过期。希望对过滤器缓存设置超时时长，可以设置最大空闲时间。
#### 节点级的过滤器缓存设置

节点级过滤器缓存是默认的缓存类型，应用于分配到给定节点上的所有分片（设置 index.cache.filter.type 属性为 node，或者不设置这个属性）。ES 允许使用 indices.cache.filter.size 属性来配置这个缓存的大小，既可以使用百分数，如 20%（默认值），也可以使用确定的数值，如 1024mb。如果使用百分数，ES 会按当前节点的最大堆内存的百分比来计算内存使用量。

节点级过滤器缓存是 LRU 类型（最近最少使用）缓存，这意味着为了给新纪录腾出空间，在删除缓存记录时，使用次数最少得那些记录会被删除。

### 字段数据缓存

字段数据缓存在查询涉及切面计算或给予字段数据排序时使用。ES所做的事加载相关字段的全部数据到内存中，从而使 ES 能够快速地基于文档访问这些值。注意，从硬件资源的角度，构建字段数据缓存代价通常很高，因为字段的所有数据都需要加载到内存中，需要消耗 I/O 操作和 CPU 资源。

>对于每个用来排序或做切面计算的字段，其数据都需要加载到内存中：所有的词项。
>这样做的代价非常高昂，尤其是应用于那些高基数的字段（拥有大量不同词项的字段）时。

#### 索引级字段数据缓存配置

也可以使用索引级别的字段数据缓存，但与索引级过滤器缓存类似，并不建议使用它。原因就是很难预测哪个分片或索引会分配到哪个节点，因此无法预估缓存每个索引需要的内存大小，而这会带来内存使用方面的问题。

当然，如果你仍需要使用。可以通过设置 index.fielddata.cache.type 属性为 resident 或 soft 来实现。跟描述过滤器缓存时讨论过的情形类似，除非想删除，否则 resident 类型的缓存是不能被 JVM 删除的。推荐在使用索引级字段数据缓存时使用 resident 类型的缓存，因为重建字段数据缓存代价很高，并且会影响 ES 的查询性能，而 soft 类型的字段数据缓存在缺少内存时会被 JVM 清除掉。

#### 节点级字段数据缓存配置

ES 0.90.0 版本中，如果没有修改过配置，节点级字段数据缓存是默认的字段数据缓存类型，可以使用下列属性进行配置：

* index.fielddata.cache.size：制定了字段数据缓存的最大值，既可以是一个百分比的值，如 20%，也可以是一个绝对的内存大小，如 10GB。百分比的话 ES 会按当前节点的最大堆内存的百分比来计算内存使用量。
* index.fielddata.cache.expire：指定字段数据缓存中记录的过期时间，默认为 -1，表示缓存中的记录永不过期。如果要设置字段数据缓存过期时长，可以设置最大空闲时间。
#### 过滤

ES还允许选择性地将某些字段值加载到字段数据缓存中。在某些情况下非常有用，如基于字段数据排序或切面计算时。ES 支持两种类型三种形式的字段数据过滤，即基于词频、基于正则表达式，以及基于两者的组合。

某些场景中字段数据过滤非常有用，例如从切面计算的结果中排除那些低频词项。具体来说，索引中某些词项存在拼写错误，而这些词项一定是低基数词项，不想基于它们做切面计算，可以从数据里删除、修正或使用过滤器从字段数据缓存中删除。这样不仅返回结果得到了过滤，同时因为更少的数据存储在内存中，降低了字段数据缓存的总量。

#### 添加字段数据过滤信息

引入字段数据缓存过滤信息，需要在映射文件的字段定义部分额外添加两个对象：fielddata对象及其子对象 filter。扩展后的字段定义（以某个抽象的 tag 字段为例）：

```json
"tag": {
  "type": "string",
  "index": "not_analyzed",
  "fielddata": {
    "filter": {
      ...
    }
  }
}
```

#### 基于词频过滤

基于磁盘过滤的结果是只加载那些频率高于指定最小值且低于指定最大值的词项，其中词频最小值和最大值分别由 min 和 max 参数指定。词频的频率范围不是针对整个索引的，而是针对索引段的。同一个词项在段级和索引级的频率分布往往不一样，这个特性非常重要。参数 min 和 max 可以是百分比的形式，也可以是一个绝对词频数。

另外，min_segment_size 属性指定了在构建字段数据缓存时，索引段应满足的最小文档数，小于该文档数的索引段不会被考虑。

例如，指向保存来自容量不小于 100 的索引段，且词频在段中介于 1% 和 20% 之间的词项到字段数据缓存中，可以进行如下字段映射：

```json
{
  "book": {
    "properties": {
      "tag": {
        "type": "string",
        "index": "not_analyzed",
        "fielddata": {
          "filter": {
            "frequency": {
              "min": 0.01
              "max": 0.2,
              "min_segment_size": 100
            }
          }
        }
      }
    }
  }
}
```

#### 基于正则表达式过滤

只有匹配特定正则表达式的词项会加载到字段数据缓存中。如果只想缓存来自 tag 字段的数据，如 Twitter 标签（以字符 # 开头），应配置映射：

```json
{
  "book": {
    "properties": {
      "tag": {
        "type": "string",
        "index": "not_analyzed",
        "fielddata": {
          "filter": {
            "regex": "^#.*"
          }
        }
      }
    }
  }
}
```

#### 基于正则表达式和词频过滤

组合基于词频和基于正则表达式的过滤方法。如果想把 tag 字段的数据保存到字段数据缓存中，但是只缓存那些以字符 # 开头，且所在索引段至少有 100 个文档，以及词项在段中介于 1% 和 20% 之间的词项，映射如下：

```json
{
  "book": {
    "properties": {
      "tag": {
        "type": "string",
        "index": "not_analyzed",
        "fielddata": {
          "filter": {
            "frequency": {
              "min": 0.1,
              "max": 0.2,
              "min_segment_size": 100
            },
            "regex": "^#.*"
          }
        }
      }
    }
  }
}
```
>字段数据缓存虽然不是在索引期间构建的，但却可以在查询期间重建，可以在运行时改变过滤行为，并具体公国使用映射 API 更新 fielddata 配置来实现。注意，改变字段数据缓存过滤设置后清空缓存，可以通过使用清理缓存 API 来实现。

#### 一个过滤的例子

本小节刚开始的例子，排除切面计算结果中的低频词项。低词频项指的是词频最低的那 50% 的词项。为了验证过滤效果，用如下命令创建 books 索引：

```shell
curl -XPOST 'localhost:9200/books' -d '{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mapping": {
    "book": {
      "properties": {
        "tag": {
          "type": "string",
          "index": "not_analyzed",
          "fielddata": {
            "filter": {
              "frequency": {
                "min": 0.5,
                "max": 0.99
              }
            }
          }
        }
      }
    }
  }
}'
```
然后使用 bulk API 索引一些文档：
```shell
curl -s -XPOST 'localhost:9200/_bulk' --data-binary '
{"index": {"_index": "books", "_type": "book", "_id": "1"}}
{"tag": ["one"]}
{"index": {"_index": "books", "_type": "book", "_id": "2"}}
{"tag": ["one"]}
{"index": {"_index": "books", "_type": "book", "_id": "3"}}
{"tag": ["one"]}
{"index": {"_index": "books", "_type": "book", "_id": "4"}}
{"tag": ["four"]}
'
```
运行查询验证简单的词项切面计算（切面计算使用到了字段数据缓存）：
```shell
curl -XGET 'localhost:9200/books/_search?pretty' -d '{
  "query": {
    "match_all": {}
  },
  "facets": {
    "tag": {
      "terms": {
        "fields": "tag"
      }
    }
  }
}'
```
响应中，切面计算只涉及了词项 one，其它 4 个被忽略了。讲定词项 four 存在拼写错误，就已经达到目的了。
### 清除缓存

在改变字段数据过滤以后需要清除缓存，这点很关键。当改变一些明确设定了缓存键值的查询时也需要清除缓存，而使用 ES 的 _cache rest 端点就可以做到这点。

#### 单一索引缓存、多索引缓存和全部缓存的清除

清空全部缓存的最简单做法：

```shell
curl -XPOST 'localhost:9200/_cache/clear'
```
清空一个或多个索引的缓存。例如清除 mastering 索引的缓存：
```shell
curl -XPOST 'localhost:9200/mastering/_cache/clear'
```
同时清除 mastering 和 books 索引的缓存：
```shell
curl -XPOST 'localhost:9200:mastering,books/_cache/clear'
```

#### 清除特定缓存

也可以只清楚一种指定类型的缓存。以下列出可以被单独清除的缓存类型：

* filter：可以通过设置 filter 参数为 true 来清除。反之为了避免清除这种缓存需要设置为 false。
* filter_data：可以通过设置 filter_data 参数为 true 来清除。反之为了避免清除这种缓存需要设置为 false。
* bloom：可以通过设置 bloom 参数为 true 来清除 bloom 缓存（如果某种倒排索引格式使用了 bloom filter ，则可能会使用这种缓存）
例如，清除 mastering 索引的字段数据缓存，并保留 filter 缓存和 bloom 缓存，则可以执行：

```shell
curl -XPOST 'localhost:9200/mastering/_cache/clear?field_data=true&filter=false&bloom=false'
```

#### 清除字段相关的缓存

除了清除全部或特定的缓存，还可以清除指定字段的缓存。在需要的请求中增加 fields 参数，参数值为索要清除缓存的相关字段名，多个字段名用逗号分隔。

例如，清除 mastering 索引里 title 和 price 字段的缓存：

```shell
curl -XPOST 'localhost:9200/mastering/_cache/clear?fields=title,price'
```

## 小结

本章，学习了如何选择合适的目录来使 ES 以最高效的方式访问底层 I/O 系统，也学习了如何使用多播和单播模式类配置节点的发现模块。然后讨论了网关模块，它能控制进行集群恢复的时机，同时也讨论了恢复模块及其配置。此外，还学习了如何分析 ES 返回的索引段信息。最后了解了 ES 缓存的工作机制，如何调整它以及如何控制字段数据缓存的构建方式。


---
categories: ["process"] 
tags: ["goreman"]  
title: "goreman"
# linkTitle: ""
weight: 21
description: >
  
---

# 概述

Linux下多进程管理工具对开发和运维都很有用，常见的功能全面的主流工具主要有monit、supervisor。不过开发中使用则推荐轻量级小工具 [goreman](https://github.com/mattn/goreman)。

goreman 是对 Ruby 下广泛使用的 foreman 的重写，毕竟基于golang的工具简单易用很多。

>goreman的作者是mattn，在golang社区挺活跃的日本的一名程序员。foreman原作者也实现了一个golang版：forego，不过没有goreman好用，举个例子：coreos的etcd就是使用的goreman来一键启停单机版的etcd集群。

# 安装

>前提：
>1. 先安装好 go 环境
>2. 将 $GOPATH/bin 添加到 $PATH

go 工具安装都比较简单：

```shell
go get github.com/mattn/goreman
# 或
go install github.com/mattn/goreman@latest
goreman help
```

# 使用

>善用 goreman help

1. 新建一个 Procfile 文件，如果改名则需要  `goreman -f` 指定
2. 在包含 Procfile 的目录下执行： `goreman start` 
3. 关闭时直接 ctrl + c 退出，goreman 会自动把所有启动的进程都 shut down
# 举例

## kafka

以 [Apache kafka](https://link.segmentfault.com/?enc=lsohoYw0%2BDPJ0r7LmzdIDw%3D%3D.j3G7cbkJOFFj9KmkW5zxerxElou1iBsI53g4YklmuTc%3D) 的使用为例，了解的朋友应该知道，kafka 使用时通常需要启动两个进程：zookeeper 和 kafka broker，因此可以编写一个 kafka 开发环境的 Procfile：

```plain
zookeeper: bash ~/tool/kafka_2.11-0.8.2.1/bin/zookeeper-server-start.sh config/zookeeper.properties
broker: bash ~/tool/kafka_2.11-0.8.2.1/bin/kafka-server-start.sh config/server.properties
```
然后执行  `goreman start` ，可以看到不同颜色区分的 zookeeper、kafka broker 进程的启动日志。
关闭时，直接 ctrl + c，则两个 bash 进程也会被自动关闭。

## etcd raftexample

```plain
# Use goreman to run `go install github.com/mattn/goreman@latest`
raftexample1: ./raftexample --id 1 --cluster http://127.0.0.1:12379,http://127.0.0.1:22379,http://127.0.0.1:32379 --port 12380
raftexample2: ./raftexample --id 2 --cluster http://127.0.0.1:12379,http://127.0.0.1:22379,http://127.0.0.1:32379 --port 22380
raftexample3: ./raftexample --id 3 --cluster http://127.0.0.1:12379,http://127.0.0.1:22379,http://127.0.0.1:32379 --port 32380
```

# 高级用法

上述是最简单的使用场景：直接使用 goreman start，不过有个缺点，即 goreman 绑定到了当前的 session，而且不能灵活控制多个进程启停以及顺序。而实际开发过程中，通常需要经常单独启停某个正在开发的模块相关的进程，比如上面例子中的 kafka-broker，而 Zookeeper 通常不需要频繁启停。

可以使用更高级的 goreman run 命令来实现，如：

```shell
# 先启动 Zookeeper
goreman run start zookeeper
# 然后启动 kafka
goreman run start broker
# 查看进程状态
goreman run status
# 停止 broker 进程
goreman run stop broker
# 重启 broker 进程
goreman run restart broker
```

# 小结

多进程管理是目前开发尤其是互联网web、服务器后端很常用的工具，尤其上云之后，云应用普遍推崇的 microservices 微服务架构进一步增加了后端进程数。而 goreman 很适合开发环境使用，能够一键式管理多个后台进程，并及时清理环境。不过真正的生产环境，还是使用monit/m、supervisor 等更成熟稳定、功能全面的多进程管理工具。


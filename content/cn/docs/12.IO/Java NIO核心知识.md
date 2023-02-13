---
categories: [""]
tags: [""]
title: "Java NIO核心知识"
# linkTitle: ""
weight: 5
description: >

---

# 简介

NIO（Non-blocking I/O，在Java领域，也称为New I/O），是一种同步非阻塞的I/O模型，也是I/O多路复用的基础。IO多路复用，一言以蔽之，就是**"复用"一个线程或一个进程，同时监测若干个（"多路"）文件描述符是否可以执行IO操作的能力。** 在I/O编程过程中，当需要同时处理多个客户端接入请求时，可以利用多线程或者I/O多路复用技术进行处理。**I/O多路复用技术通过把多个I/O的阻塞复用到同一个select的阻塞上，从而使得系统在单线程的情况下可以同时处理多个客户端请求。**与传统的多线程/多进程模型比，I/O多路复用的最大优势是系统开销小，系统不需要创建新的额外进程或者线程，也不需要维护这些进程和线程的运行，降低了系统维护的工作量，节省了系统资源。

IO多路复用的优势并不是对于单个连接能处理得更快，而是在于能处理更多的连接。如果处理的连接数不是很高的话，使用select/epoll的web server不一定比使用multi-threading + blocking IO的web server性能更好，可能延迟还更大。

关于 Java NIO 相关的核心，总的来看包含以下三点，分别是：

* Channel
* Buffer
* Selector
# BIO

**通过 socket 通信，实际上就是通过文件描述符 fd 读写文件**

## C10k问题

C10K 就是 Client 10000 问题，即「在同时连接到服务器的客户端数量超过 10000 个的环境中，即便硬件性能足够， 依然无法正常提供服务」，简而言之，就是单机1万个并发连接问题。这个概念最早由 Dan Kegel 提出并发布于其个人站点（ [http://www.kegel.com/c10k.html](http://www.kegel.com/c10k.html) ）

>设计 Unix 的 PID 的时候，采用了有符号的16位整数，这就导致一台计算机上能够创建出来的进程无法超过32767个。

# Channel

Channel 就是通道。可以往通道里写数据、读数据。它是双向的，与之配套的是 Buffer，即要往一个通道里写数据，必须要将数据写到一个 Buffer 中，然后写到通道里。同样，从通道里读数据，必须将通道的数据先读取到一个 Buffer 中，然后再操作。

在 NIO 中 Channel 有多种类型：

* SocketChannel
* ServerSocketChannel
* DatagramChannel
* FileChannel
## SocketChannel

对标 Socket，可以直接将它看做所建立的连接。通过 SocketChannel ，可以利用 TCP 协议进行读写网络数据。

SocketChannel 主要在两个地方出现：

* 客户端，客户端创建一个 SocketChannel 用于连接至远程的服务端。
* 服务端，服务端利用 ServerSocketChannel 接收新连接之后，为其创建一个 SocketChannel 。
随后，客户端和服务端就可以通过这两个 SocketChannel 相互发送和接收数据。

## ServerSocketChannel

服务端创建的 Socket，可以对标 ServerSocket。

主要是用来接待新连接，监听新建连的 TCP 连接，为新进一个连接创建对应的 SocketChannel。然后通过新建的 SocketChannel 可以进行网络数据的读写，与对端交互。

ServerSocketChannel 主要出现在一个地方：服务端。

服务端需要绑定一个端口，然后监听新连接的到来，这个活儿就由 ServerSocketChannel 来干。

服务端内常常会利用一个线程，一个死循环，不断地接收新连接的到来。

```java
ServerSocketChannel serverSocketChannel = ServerSocketChannel.open();
...
while(true) {
  // 接收新的连接
  SocketChannel socketChannel = serverSocketChannel.accept();
  ...
}
```

## DatagramChannel

Datagram（数据报），即 UDP 协议，是无连接协议。利用 DatagramChannel 可以直接通过 UDP 进行网络数据的读写。

## FileChannel

文件通道，用来进行文件的数据读写。

我们日常开发主要是基于 TCP 协议，所以我们把精力放在  SocketChannel 和  ServerSocketChannel 上即可。

# Buffer

Buffer 就是内存中可以读写的一块地方，叫缓冲区，用于缓存数据。

其并没有太多原理可介绍，主要关注 Java NIO Buffer 的 API 即可。当然其 API 有很多优化之处，所以 Netty 没用 Java NIO Buffer 而是自行实现了一个 Buffer，叫 ByteBuf。

为什么 Channel 必须和 Buffer 搭配使用？

>其实网络数据是面向字节的，但是读写的数据往往是多字节的，假设不用 Buffer 那需要一个字节一个字节的调用读和调用写，非常麻烦。
>所以搞个 Buffer 将数据拢一拢，这样之后的调用才能更好地处理完整的数据，方便异步的处理等等。

# Selector

Selector 是 I/O 多路复用的核心组件。

一个 Selector 上可以注册多个 Channel ，从上面已经知道一个 Channel 就对应了一个连接，因此一个 Selector 可以管理多个 Channel 。

当任意 Channel 发生读写事件时，通过 `Selector.select()` 就可以捕捉到事件的发生，因此可以利用一个线程，死循环的调用 `Selector.select()`，这样可以利用一个线程管理多个连接，减少了线程数，减少了线程的上下文切换和节省了线程资源。这就是 Selector 的核心功能。

具体详细步骤：

1. 创建一个 Selector
```java
Selector selector = Selector.open();
```
2. 将要被管理的 Channel 注册到 Selector 上，并声明感兴趣的事件
```java
SelectionKey key = channel.register(selector, Selectionkey.OP_READ | Selectionkey.OP_WRITE);
```
事件类型：
```java
public static final in OP_READ = 1 << 0;
public static final in OP_WRITE = 1 << 2;
public static final in OP_CONNECT = 1 << 3;
public static final in OP_ACCEPT = 1 << 4;
```
3. 当 Channel 发生读或写事件，调用 `Selector.select()` 就可以得知有事件发生。 
该函数具体有3个重载方法：

    * int selectNow()：不论是否有误事件发生，立即返回
    * int select(long timeout)：至多阻塞 timeout 时间（或被唤醒），如果提前有事件发生则提前返回
    * int select()：一直阻塞，直到有事件发生（或被唤醒）。
返回值就是就绪的通道数，一般判断大于 0 即可后续的操作，即调用：

```java
Set selectedKeys = selector.selectedKeys();
```
4. 获得一个类型为 Set 的 selectedKeys 集合。
可以通过 selectedKey 得知当前发生的是什么事件，有 isAcceptable、isReadable 等等。

还能获得对应 channel 进行相应的读写操作，还有获取 attachment 等等。

所以得到了 selectedKeys 就可以通过迭代器遍历所有发生事件的连接，然后进行操作：

```java
while(true) {
 int readyNum = selector.select();
 if (readyNum == 0) {
    continue;
 }
 Set selectedKeys = selector.selectedKeys();
 Iterator keyIterator = selectedKeys.iterator();
 while(keyIterator.hasNext()) {
    SelectionKey key = keyIterator.next();
    if(key.isAcceptable()) {
        // a connection was accepted by a ServerSocketChannel.
    } else if (key.isConnectable()) {
        // a connection was established with a remote server.
    } else if (key.isReadable()) {
        // a channel is ready for reading
    } else if (key.isWritable()) {
        // a channel is ready for writing
    }
    keyIterator.remove(); //执行完毕之后，需要在循环内移除自己
 }
}
```

还有个方法是 Selector.wakeup()，可以唤醒阻塞着的 Selector。

前提：如果 Channel 要和 Selector 搭配，那它必须得是非阻塞的，即配置：

```java
channel.configureBlocking(false);
```
从上面的分析，可以得知 Selector 处理事件的时候必须快，如果长时间处理某个事件，那么注册到 Selector 上的其他连接的事件就不会被及时处理，造成客户端阻塞。

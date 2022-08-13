---
categories: [""] 
tags: [""] 
title: "端口转发socat"
# linkTitle: ""
weight: 5
description: >
  
---

简介

[socat](https://linux.die.net/man/1/socat) 功能跟 [NetCat](https://network.fasionchan.com/zh_CN/latest/toolkit/nc.html) 一样，但更安全(支持 chroot )，兼容多种协议， 支持操作 文件 ( file )、 管道 ( pipe )、 设备 ( device )、 TCP 套接字、 Unix 套接字、 SOCKS 客户端、 CONNECT 代理以及 SSL 等等。

安装

```plain
sudo apt update && sudo apt install socat
```

端口转发

```plain
# 将 80 端口转发到 202.54.1.5 
socat TCP-LISTEN:80,fork TCP:202.54.1.5:80

# 转发TCP
nohup socat TCP4-LISTEN:30000,reuseaddr,fork TCP4:1.1.1.1:30000 >> socat.log 2>&1 &

# 转发UDP
nohup socat -T 600 UDP4-LISTEN:10000,reuseaddr,fork UDP4:1.1.1.1:10000 >> socat.log 2>&1 &
```

```plain
# 通过 socat 转发 2280 端口，以支持某些不支持 CONSUL_HTTP_HOST 的库的运行
if type "socat" > /dev/null 2>&1; then
  nohup socat TCP-LISTEN:2280,range=127.0.0.1/32,reuseaddr,fork TCP:$CONSUL_HTTP_HOST:2280 > /dev/null 2>&1 &
fi
```

## 实际使用

```shell
ssh -f -N -L 2280:127.0.0.1:2280 huangbo.bin@10.231.243.5
```


运行：bash socat_hb.sh 10.231.243.5

```shell
#!/bin/bash
echo "READY TO CONNECT TO: $1"
socat -d -d TCP4-LISTEN:2280,fork TCP4:$1:2280 &
socat -d -d TCP4-LISTEN:2150,fork TCP4:$1:2150
```


## ssh端口转发

### ssh基本操作

```shell
# 生成公私钥

# 将所有的ssh公钥发送到服务器
ssh-copy-id zhangsan@ip
man ssh-copy-id
cat .ssh/id_rsa.pub | ssh zhangsan@ip tee .ssh/authorized_keys

# scp拷贝小文件
touch 1.tmp
scp 1.tmp zhangsan@ip:/tmp/foobar.md

# rsync 拷贝大文件
rsync -avP ./clean-pvnet zhangsan@ip:clean

ssh zhangsan@ip touch .ssh/authorized_keys
# 修改ssh配置文件
vi /etc/ssh/ssd_config
# 具体内容自行搜索，可修改登陆方式/端口等
# ssh重新加载
service sshd reload

# 使用其它端口登陆ssh
ssh zhangsan@ip -p7222
curl localhost:7222
```
### ssh正向转发

将当前的请求转发到远程服务器

```shell
# 公式，123为本机端口，456为远程端口
ssh -L 123:loclhost:456 remotehost

```



### ssh反向转发

将远程服务器的请求转发到本机

```shell
# 公式，123为本机端口，456为远程端口
ssh -R 123:localhost:456 remotehost
```

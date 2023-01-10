---
categories: [""]
tags: [""]
title: "SpringBoot-06指标监控"
# linkTitle: ""
weight: 10
description: >

---

# SpringBoot Actuator

## 简介

未来每一个微服务在云上部署以后，我们都需要对其进行监控、追踪、审计、控制等。SpringBoot就抽取了Actuator场景，使得每个微服务快速引用即可获得生产级别的应用监控、审计等功能。

官方文档：[using.htm l# using.packaging-for-production](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.packaging-for-production) -> [actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator)

## 1.x与2.x对比

SpringBoot 1.x引入的Actuator是1.x版本，2.x同理。

SpringBoot Actuator 1.x：

* 支持SpringMVC
* 基于继承方式进行扩展
* 层级Metrics配置
* 自定义Metrics收集
* 默认较少的安全策略
SpringBoot Actuator 2.x：

* 支持SpringMVC、JAX-RS以及Webflux
* 注解驱动进行扩展
* 层级&名称空间Metrics
* 底层使用MicroMeter，强大、便捷
* 默认丰富的安全策略
## 使用

导入依赖包：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```
配置：
```yaml
management:
  endpoints:
    enabled-by-default: true #暴露所有端点信息
    web:
      exposure:
        include: '*'  #以web方式暴露
```

## Endpoints

具体 Endpoints 见官方文档：[actuator # actuator.endpoints](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.endpoints)

[http://localhost:8888/actuator/beans](http://localhost:8888/actuator/beans)：所有注入bean

[http://localhost:8888/actuator/conditions](http://localhost:8888/actuator/conditions)：positiveMatches（开启的条件）；negativeMatches（未开启的条件）；

[http://localhost:8888/actuator/configprops](http://localhost:8888/actuator/configprops)：生效的配置属性值

[http://localhost:8888/actuator/env](http://localhost:8888/actuator/env)：环境变量

语法：

[http://localhost:8888/actuator/{endpointName}/detailPath](http://localhost:8888/actuator/{endpointName}/detailPath)

常用的Endpoint：

* Health：健康检查
* Metrics：运行时指标
* Loggers：日志记录
## 可视化

[https://github.com/codecentric/spring-boot-admin](https://github.com/codecentric/spring-boot-admin)

# Actuator Endpoint

## Health Endpoint

健康检查端点，一般用于在云平台，平台会定时的检查应用的健康状况，需要Health Endpoint可以为平台返回当前应用的一系列组件健康状况的集合。

注意：

* health endpoint返回的结果，应该是一系列健康检查后的一个汇总报告
* 很多健康检查默认已经自动配置，比如：数据库、redis等
* 比较容易添加自定义的健康检查机制
## Metrics Endpoint

提供详细的、层级的、空间指标信息，这些信息可以被pull（主动推送）或者push（被动获取）方式得到：

* 通过Metrics对接多种监控系统
* 简化核心Metrics开发
* 添加自定义Metrics或者扩展已有Metrics
## 管理Endpoints

### **开启与禁用Endpoints**

* 默认所有的Endpoint除过shutdown都是开启的。
* 需要开启或者禁用某个Endpoint。配置模式为 management.endpoint.<endpointName>.enabled = true
```yaml
management:
  endpoint:
    beans:
      enabled: true
```
* 或者禁用所有的Endpoint然后手动开启指定的Endpoint
```yaml
management:
  endpoints:
    enabled-by-default: false
  endpoint:
    beans:
      enabled: true
    health:
      enabled: true
```

### 暴露Endpoints

支持的暴露方式

* HTTP：默认只暴露health和info Endpoint
* JMX：默认暴露所有Endpoint
* 除过health和info，剩下的Endpoint都应该进行保护访问。如果引入SpringSecurity，则会默认配置安全访问规则

### **JMX方式**

Java消息服务，简单的说就是java 提供了一批消息发送的接口，通过JMS提供的接口， 可以实现不同系统之间消息的发送。

actuator 默认使用 JMS 方式暴露了 endPoints，但没有通过 Web 的方式。具体可见：[actuator # actuator.endpoints.exposing](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.endpoints.exposing)

使用方法：

1. 启动应用程序
2. 终端输入 jconsole 命令
3. 选择对应的应用程序
# 定制EndPoint

## 定制Health

```java
@Component
public class MyComHealthIndicator extends AbstractHealthIndicator {
    // http://localhost:8888/actuator/health 可以查看到 myCom
    @Override
    protected void doHealthCheck(Health.Builder builder) throws Exception {
        Map<String, Object> infos = new HashMap<String, Object>();
        // 建立连接判断是否监控
        if (0 == 0) {
//            builder.up();
            builder.status(Status.UP);
            infos.put("code", "200");
            infos.put("msg", "xxx");
        } else {
//            builder.down();
            builder.status(Status.OUT_OF_SERVICE);
            infos.put("code", "500");
            infos.put("msg", "this is error!!!");
        }
        builder.withDetail("ms", 300).withDetails(infos);
    }
}
```
yaml配置：
```yaml
management:
  endpoint: # 对某个端点的具体配置
    health:
      show-details: always
      enabled: true
```

## 定制Info

一般常用两种方式。

### 配置文件

```yaml
# 默认访问 /actuator/info 没有任何信息，这里定制才会有对应信息
info:
  appName: boot-web
  appVersion: 1.0.1
  mavenProjectName: @project.artifactId@ # 使用@xx@可以获取maven的pom信息
  mavenProjectVersion: @project.version@
```

### 实现InfoContributor

```java
@Component
public class AppInfoInfoContributor implements InfoContributor {
    @Override
    public void contribute(Info.Builder builder) {
        builder.withDetail("msg", "hello world").withDetails(Collections.singletonMap("hhah", "xixixi"));
    }
}
```

## 定制Metrics

### SpringBoot自动适配Metrics

* JVM metrics, report utilization of:
    * Various memory and buffer pools
    * Statistics related to garbage collection
    * Threads utilization
    * Number of classes loaded/unloaded
* CPU metrics
* File descriptor metrics
* Kafka consumer and producer metrics
* Log4j2 metrics: record the number of events logged to Log4j2 at each level
* Logback metrics: record the number of events logged to Logback at each level
* Uptime metrics: report a gauge for uptime and a fixed gauge representing the application’s absolute start time
* Tomcat metrics (server.tomcat.mbeanregistry.enabled must be set to true for all Tomcat metrics to be registered)
* [Spring Integration](https://docs.spring.io/spring-integration/docs/5.4.1/reference/html/system-management.html#micrometer-integration) metrics
 

### 增加定制Metrics

目的：增加业务打点，如接口方法访问次数等。

方法一：在业务代码中注册 MeterRegistry 并调用相应方法。

```java
@Service
public class CityService {
    @Autowired
    private CityMapper cityMapper;
    Counter counter;
    public CityService(MeterRegistry meterRegistry) {
        counter = meterRegistry.counter("cityService.getCityByID.count"); //注册
    }
    public City getCityByID(Long id) {
        counter.increment();
        return cityMapper.getByID(id);
    }
}
```
方法二：直接注入 MeterBinder 的Bean
```java
@Bean
MeterBinder queueSize(Queue queue) {
    return (registry) -> Gauge.builder("queueSize", queue::size).register(registry);
}
```

使用方法：

1. 访问 /actuator/metrics 可以发现多了一个 cityService.getCityByID.count 指标
2. 访问 /actuator/metrics/cityService.getCityByID.count 可以看到 COUNT 为0
3. 调用 /car?id=1，访问上一步的连接，可以看到 COUNT 数值
## 定制Endpoint

场景：开发ReadinessEndpoint来管理程序是否就绪，或者LivenessEndpoint来管理程序是否存活。如Kubernetes Probes。可参考：[actuator # actuator.endpoints.kubernetes-probes](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.endpoints.kubernetes-probes)

代码如下：

```java
@Component
@Endpoint(id = "myservice")
public class MyServiceEndpoint {
    // 端点的读操作：访问 /actuator/myservice 可得到该信息
    @ReadOperation
    public Map myServiceInfo() {
        return Collections.singletonMap("serviceInfo", "serviceInfo: say hello");
    }
    @WriteOperation
    public void stopMyService() {
        System.out.println("my service stopped...");
    }
}
```
使用方式：
* 读操作
    * web 访问 /actuator/myservice
    * jconsole 打开界面选择 MBeans -> {应用} -> Endpoint -> Myservice -> Operations -> myServiceInfo
* 写操作
    * jconsole 打开界面选择 MBeans -> {应用} -> Endpoint -> Myservice -> Operations -> stopMyService（可以看到应用程序控制台输出内容）

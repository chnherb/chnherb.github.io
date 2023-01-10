---
categories: [""]
tags: [""]
title: "SpringBoot-07配置与加载过程"
# linkTitle: ""
weight: 10
description: >

---

# Profile

## application-profile

为了方便多个环境适配，SpringBoot简化了 profile 功能。

## Profile条件装配

* 默认配置文件  application.yaml；任何时候都会加载
* 指定环境配置文件  application-{env}.yaml
* 激活指定环境
    * 配置文件激活
    * 命令行激活：java -jar xxx.jar --spring.profiles.active=prod  --person.name=haha
        * 修改配置文件的任意值，命令行优先
* 默认配置与环境配置同时生效
* 同名配置项，profile配置优先
## Profile分组

参考官方文档：[features # features.profiles](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.profiles)

```yaml
spring.profiles.group.production[0]=proddb
spring.profiles.group.production[1]=prodmq

使用：--spring.profiles.active=production  激活
```

# 配置加载

官方文档：[features # features.external-config](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)

## 外部配置源

常用：Java属性文件、YAML文件、环境变量、命令行参数；

## 配置文件路径

* classpath 根路径
* classpath 根路径下的 config 目录
* jar 包当前目录
* jar 包当前目录的 config 目录
* /config 子目录的直接子目录
## 配置文件加载顺序

1. 当前 jar 包内部的 application.properites 和 application.yml
2. 当前 jar 包内部的 application-{profile}.properties 和 application-{profile}.yml
3. 引用的外部 jar 包的 application.properties 和 application.yml
4. 引用的外部 jar 包的 application-{profile}.properties 和 application-{profile}.yml
指定环境优先，外部优先，后面的可以覆盖前面的同名配置项。

# 自定义starter

官方文档：[using # using.build-systems.starters](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.build-systems.starters)

## starter启动原理

* starter-pom 引入 autoconfigurer 包
* autoconfigurer 包中配置使用 META-INF/spring.factories 中 EnableAutoConfiguration 的值，使得项目启动加载指定的自动配置类
* 编写自动配置类 xxAutoConfiguration -> xxProperties
starter模块：


## 自定义starter

xxx-spring-boot-starter（启动器）

xxx-spring-boot-starter-autoconfigure（自动配置包）


# SpringBoot原理

## SpringBoot启动过程

* 创建 SpringApplication
    * 保存一些信息。
    * 判定当前应用的类型：ClassUtils、Servlet
    * bootstrappers：初始启动引导器（List<Bootstrapper>）：去spring.factories文件中找 org.springframework.boot.Bootstrapper
    * 找 ApplicationContextInitializer；spring.factories 中找 ApplicationContextInitializer
        * List<ApplicationContextInitializer<?>> initializers
    * 找 ApplicationListener 应用监听器。spring.factories 中找 ApplicationListener
        * List<ApplicationListener<?>> listeners
* 运行 SpringApplication
    * StopWatch
    * 记录应用的启动时间
    * 创建引导上下文（Context环境）createBootstrapContext()
        * 获取到所有之前的 bootstrappers 挨个执行 intitialize() 来完成对引导启动器上下文环境设置
    * 让当前应用进入headless模式。java.awt.headless
    * 获取所有 RunListener（运行监听器）【为了方便所有Listener进行事件感知】
        * getSpringFactoriesInstances 去spring.factories找 SpringApplicationRunListener. 
    * 遍历 SpringApplicationRunListener 调用 starting 方法；（相当于通知所有系统项目正在启动。）
    * 保存命令行参数；ApplicationArguments
    * 准备环境 prepareEnvironment（）;
        * 返回或者创建基础环境信息对象。StandardServletEnvironment
        * 配置环境信息对象。（读取所有的配置源的配置属性值。）
        * 绑定环境信息
        * 监听器调用 listener.environmentPrepared()；通知所有的监听器当前环境准备完成
    * 创建IOC容器（createApplicationContext）
        * 根据项目类型（Servlet）创建容器，
        * 当前会创建 AnnotationConfigServletWebServerApplicationContext
    * 准备ApplicationContext IOC容器的基本信息 prepareContext()
        * 保存环境信息
        * IOC容器的后置处理流程
        * 应用初始化器 applyInitializers
            * 遍历所有的 ApplicationContextInitializer 。调用 initialize.。来对ioc容器进行初始化扩展功能
            * 遍历所有的 listener 调用 contextPrepared。EventPublishRunListenr；通知所有的监听器contextPrepared
        * 所有的监听器 调用 contextLoaded。通知所有的监听器 contextLoaded；
    * 刷新IOC容器。refreshContext
        * 创建容器中的所有组件（Spring注解）
    * 容器刷新完成后工作 afterRefresh
    * 所有监听 器 调用 listeners.started(context); 通知所有的监听器 started
    * 调用所有runners；callRunners()
        * 获取容器中的 ApplicationRunner 
        * 获取容器中的  CommandLineRunner
        * 合并所有runner并且按照@Order进行排序
        * 遍历所有的runner。调用 run 方法
    * 如果以上有异常，调用Listener 的 failed
    * 调用所有监听器的 running 方法  listeners.running(context)，通知所有的监听器 running 
    * running如果有问题继续通知 failed。调用所有 Listener 的 failed，通知所有的监听器 failed



## Application Events and Listeners

官方文档：[spring-boot-features # boot-features-application-events-and-listeners](https://docs.spring.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-application-events-and-listeners)

**ApplicationContextInitializer**

**ApplicationListener**

**SpringApplicationRunListener**

## ApplicationRunner与CommandLineRunner







# 



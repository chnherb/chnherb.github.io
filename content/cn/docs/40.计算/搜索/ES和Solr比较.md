---
categories: [""] 
tags: [""] 
title: "ES和Solr比较"
# linkTitle: ""
weight: 5
description: >
  
---

## Lucene

Lucene是用Java写的，早期被发布在Doug Cutting的个人网站和SourceForge（一个开源软件网站）。2001年底Lucene成为Apache软件基金会jakarta项目的一个子项目。

随着每个版本的发布，这个项目得到明显的增强，也吸引了更多的用户和开发人员。2004年7月，Lucene1.4版正式发布，10月的1.4.2版本做了一次bug修正。

## ES

### 概述

ElasticSearch简称ES，是基于ApacheLucene构建的开源搜索引擎，是当前最流行的企业级搜索引擎。Lucene本身就可以被认为迄今为止性能最好的一款开源搜索引挂工具包，但是lucene的API相对复杂，需要深厚的搜索理论。很难集成到实际的应用中去。

ES是采用java语言编写，提供了简单易用的RestFulAPI，开发者可以使用其简单的RestFul API，开发相关的搜索功能，从而遵免1ucene的复杂性。

### 诞生

多年前，一个叫做ShayBanon的刚结婚不久的失业开发者，由于妻子要去伦敦学习厨

师，他便跟着也去了。在他找工作的过程中，为了给妻子构建一个食谱的搜索引擎，他开始

构建一个早期版本的Lucene。

直接基于Lucene工作会比较困难，所以Shay开始抽象Lucene代码以便Java程序员可以在

应用中添加搜索功能。他发布了他的符一个开源项目，叫做“Compass”。

后来Shay找到一份工作，这份工作处在高性能和内存数据网格的分布式环境中，因此高性能

的、实时的、分布式的搜索引擎也是理所当然需要的。然后他决定重写Compass库使其成为一

个独立的服务叫做Elasticsearch。

第一个公开版本出现在2916年2月，在那之后Elasticsearch已经成为Github上最受欢迎的项目

之一，代码贡献者超过388人。一家主营Elasticsearch的公司就此成立，他们一边提供

商业支持一边开发新功能，不过Elasticsearch将永远开源且对所有人可用。

Shay的妻子依旧等待着她的食谱搜索…

目前国内大厂几乎无一不用Elasticsearch，阿里，腾讯，京东，美团等等…




## ElasticSearch VS Solr

1、ES基本是开箱即用，非常简单。Solr安装略微复杂一丢丢!

2、**Solr利用Zookeeper进行分布式管理，而Elasticsearch自身带有分布式协调管理功能**.

3、Solr支持更多格式的数据，比奶SON、XML、CSV，而Elasticsearch仅支持json文件格式。

4、Solr官方提供的功能更多，而Elasticsearch本身更注重于核心功能，高级功能多有第三方插件提供，例如图形化界面需要kibana友好支撑

5、Solr查询快，但更新索引时慢(即插入删除慢)，用于电商等查询多的应用;

1）ES建立索引快(即查询慢)，即实时性查询快，用于facebook新浪等搜索。

2）Solr是传统搜索应用的有力解决方案，但Elasticsearch更适用于新兴的实时搜索应用。

6、Solr比较成熟，有一个更大，更成熟的用户、开发和贡献者社区，而Elasticsearch相对开发维护者较少，更新太快，学习使用成本较高。

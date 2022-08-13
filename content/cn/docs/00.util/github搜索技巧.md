---
categories: [""] 
tags: [""] 
title: "github搜索技巧"
# linkTitle: ""
weight: 5
description: >
  
---

# github网页结构

网页上有项目名、更新日期、简介、贡献者、编程语言等信息

# 搜索技巧

## in关键词搜索

关键字 in 可以搜索出 GitHub 上的资源名称 name、说明 description 和 readme 文件中的内容。description 就是 About 那一块的信息。

比如说 

```plain
java in:name,description,readme 
```
其中，逗号分割表示或的意思，意思就是三者中只要有一个有 java 就行。 
## stars/fork数量搜索

搜索 GitHub 时用 star 数量和 fork 数量判断这个项目是否优秀的标准之一，我们可以使用 大小，小于，范围等方式过滤：

```plain
java in:name stars:>1000 forks:>500 
```
表示星数大于 1000 且 forks 数大于 500，名字中含有 java 的项目。
如果要指定范围，可以这样：

```plain
java in:name stars:5000..10000 
```
表示星数在 5000 到 10000 之间，名字中有 java 的项目。
## 按创建/更新时间搜索

按创建、更新时间搜索可以把版本老旧的资源筛选出去，比如说:

按创建时间：created:>=YYYY-MM-DD

按更新时间：pushed:>=YYYY-MM-DD

比如说搜索 2021 年之后创建的 java 项目：

```plain
java in:name created:>=2021-01-01 pushed:>=2021-01-01
```
## 按文件/路径内容搜索

在 GitHub 还可以按文件内容和文件路径搜索，不过有一定的限制，首先必须登录，此外项目的文件不能太多，文件不能太大，在需要搜索 fork 资源 时，只能搜索到 star 数量比父级资源多的 fork 资源，并需要加上 fork:true 查询，搜索结果最多可显示同一文件的两个分段，但文件内可能有更多结果，不能使用通配符。

语法格式：

```plain
按文件内容 keyword in:file
按文件路径 keyword in:path
```
比如：
```plain
java in:file,path
```
## 按文件名、大小、扩展名搜索

语法格式如下：

```plain
按文件名搜索：keyword filename:FILENAME
按文件大小搜索：keyword size:>=大小
按扩展名搜索：keyword extension:EXTENSION
```
举个例子：
```plain
java filename:aaa size:>10 extension:py 
```
## 按编程语言来搜索

语法格式：

```plain
keyword language:LANGUAGE
```
比如：python language:javascript 表示搜索 javascrip 语言中关于 python 的项目。 
## 常用搜索

```plain
"key word" in:name,description,readme language:java stars:>100
```

---
categories: [""] 
tags: [""] 
title: "util-cli"
# linkTitle: ""
weight: 5
description: >
  
---



>本文主要介绍一个基于Golang语言的cli工具，以及部署、使用方法整个链路的流程

## 背景

原来使用石墨文档记录笔记，因为种种原因后来想换成github的pages记录，但是石墨文档导出的MD文件是将图片的原始数据base64加密直接存储在MD文件中，对于原始MD文件的查看是极不友好的，因此想写一个脚本工具将图片原始进行转换，还原MD源文件的简洁。

## 功能

* 解析 MD 文件中的 base64 图片数据
* 将 base64 图片数据存储到本地相对文件夹的对应文件中
* 文件名自动编号
* 自动递归编译指定文件夹中的所有MD文件

## 实现

* 使用正则匹配md文件中的base64图片数据
* 基于go语言的cobra包实现命令行交互
* 基于slog包控制界面信息的展示

### 源码

上传到GitHub：[https://github.com/chnherb/util-cli](https://github.com/chnherb/util-cli)

### 部署

```shell
# 切到仓库目录
# 编译生成可执行文件
go build ./
git init
git add .
git commit -m "feat: util-cli init"
git remote add origin https://github.com/chnherb/util-cli.git
```
## 下载方法

```shell
# 下载文件到本地，注意修改成自己的路径
# https://github.com/chnherb/util-cli/blob/master/util-cli?row=true
cd /Users/bo/software/ && \
wget -c -O util-cli https://raw.github.com/chnherb/util-cli/master/util-cli && \
chmod +x util-cli && \
ln -s /Users/bo/software/util-cli /usr/local/bin/util-cli

# 注意：软连接必须是全路径，不可用~、./等
```
## 使用说明

```shell
util-cli -h --help
util-cli picbase64 replace base64图像替换
--src: 工作路径，md文件所在路径
--chapter: 当前章节主题，用于生成图片前缀名
--rewrite: 是否替换源文件，默认true，即直接修改原md文件

# 命令示例
util-cli picbase64 replace \
--src=/Users/bo/hb_blog --chapter=test --rewrite=false
```

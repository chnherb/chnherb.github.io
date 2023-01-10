---
categories: ["shell"] 
tags: ["Shebang"] 
title: "Shebang"
# linkTitle: ""
weight: 1
description: >
  
---

# 简介

在计算机领域，Shebang（也称为Hashbang）是一个由井号和叹号构成的字符序列  `#!` ，其出现在文本文件中的第一行的前两个字符。

在文件中存在 Shebang 的情况下，类 Unix 操作系统的程序加载器会分析 Shebang 后的内容，将这些内容作为解释器指令，并调用该指令，并将载有 Shebang 的文件路径作为该解释器的参数。

例如，以指令  `#!/bin/sh` 开头的文件在执行时会实际调用 /bin/sh 程序。

由于 # 符号在许多脚本语言中都是注释标识符，Shebang 的内容会被这些脚本解释器自动忽略。 在 # 字符不是注释标识符的语言中，例如 [Scheme](https://zh.wikipedia.org/wiki/Scheme)，解释器也可能忽略以 #! 开头的首行内容，以提供与 Shebang 的兼容性。 

# env bash

使用方式：

```shell
#!/usr/bin/env bash
```
## env 的作用

env 命令用于显式系统中已存在的环境变量，以及在定义的环境中执行命令。

```shell
$ ls /usr/bin | grep env
env
printenv
```
与  `#!/bin/bash` 声明了 bash 所在位置，系统知道去哪里找 bash 相比， `#!/usr/bin/env bash` 只声明了 env 所在位置，然后去 $PATH 中找 bash 的位置。
比如执行  `env python` 时，它其实会去  `env | grep PATH` 中的几个路径中依次寻找 python 的可执行文件。

# env bash和bash对比

## env bash优缺点

优点：

*  `#!/usr/bin/env bash` 不必在系统的特定位置查找命令解释器，为多系统间的移植提供了极大的灵活性和便利性（某些系统的一些命令解释器并不在 /bin 或一些约定的目录下，而是一些比较奇怪的目录）
* 不了解主机环境时，`#!/usr/bin/env bash` 可以使开发工作快速开展
缺点：

* 对安全性比较看重时，该写法会出现安全隐患
>该写法会从 $PATH 中查找命令解释器所在的位置并匹配第一个找到的位置，这意味着可以伪造一个假的命令解释器，并将伪造后的命令解释器所在目录写入 PATH 环境变量中并位于靠前位置，这样就形成了安全隐患。

* 因为 Shebang 解析的设计导致无法传递多个多个参数
>如 `#!/usr/bin/perl -w` 和 `#!/bin/csh -f` ，而如果使用 `#!/usr/bin/env perl -w` 这种写法的话，perl -w 会被当成一个参数，但根本找不到 perl -w 这个命令解释器，就会出错。

* 某些系统 env 命令的位置不在 /usr/bin 下
## bash优缺点

优点：

* 准确指出所需命令解释器的位置
* 安全性相对较高
* 可以传递多个参数
缺点：

* 移植性相对较差，很多系统的命令解释器位置不一致
* 一些命令解释器的位置记不住

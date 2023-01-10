---
categories: ["shell"] 
tags: ["grep", "sed", "awk"] 
title: "shell文本处理三剑客"
# linkTitle: ""
weight: 20
description: >
  
---

# grep

grep 命令用于查找文件里符合条件的字符串。

## 语法

```shell
grep [-abcEFGhHilLnqrsvVwxy]\
[-A<显示行数>][-B<显示列数>][-C<显示列数>][-d<进行动作>]\
[-e<范本样式>][-f<范本文件>][--help][范本样式][文件或目录...]

grep "root" /etc/passwd
```
egrep是grep命令的扩展
### **-a或--text** 

不要忽略二进制的数据，以文本文件方式搜索

### -c

计算找到符合行的次数

### --color

对查找到的文本颜色标红

### -n 或 --line-number

在显示符合样式的那一行之前，标示出该行的列数编号。

```shell
grep -n --color "root" /etc/passwd
```
### **-v或--invert-match** 

 反向选择，显示不包含匹配文本的所有行。

### -h

查询多文件时不显示文件名

### -i

不区分大小写

### -l

查询多文件时只输出包含匹配字符的文件名

### -v

取反

### -s

不显示不存在或无匹配文本的错误信息

### ^和$

^表示以xx字符开头，$表示以什么结尾

```shell
grep "^root" /etc/passwd
```

## 正则表达式

^：锚定行的开头

$：锚定行的结尾

"."：点匹配一个非换行符的字符

"*"：匹配零个或多个先前字符

".*"：一起用代表任意字符

[]：匹配一个指定范围内的字符，如"[Gg]rep"匹配Grep和grep

[^]：匹配一个不再指定范围内的字符，

{}：匹配次数，{2}表示2次，{1-3}表示1到3次

## 实战

### 前后几行

```shell
# 匹配行及后5行，不区分大小写
grep -A 5 -i foo file
# 匹配行及前5行，不区分大小写
grep -B 5 -i foo file
# 匹配行及前后5行，不区分大小写
grep -C 5 -i foo file
```
### 调试命令技巧

使用--color高亮查看grep命令的匹配结果

```shell
grep "[0-9][0-9]" test.txt
```
### 去除#号行内容和空行

```shell
grep -v "#" /usr/local/nginx/conf/nginx.conf.default | grep -v "^$"
```
### 匹配ip

```shell
egrep "[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$" test.txt
# $表示最后最多只匹配3位数字，$表示结尾

#简化
egrep "([0-9]{1,3}\.){3}[0-9]{1,3}$" test.txt
```


# awk

AWK 是一种处理文本文件的语言，是一个强大的文本分析工具。

## 语法

```shell
awk [选项参数] 'script' var=value file(s)
# 或
awk [选项参数] -f scriptfile var=value file(s)
```

### -F

指定分割字符（默认以空格为分割字符）

```shell
# 用法
-F: 或 -F":"

# 以 : 为分割字符，打印前5行的第1列和最后1列
awk -F: '{print $1,$NF}' /etc/passwd | head -5
# 以空格分割打印

# 指定以 : 分割打印
awk -F: '{print $1":"$NF}' /etc/passwd | head -5
```
### -v

设置变量

```shell
# 数字直接加，字符串拼接
awk -va=1 '{print $1,$1+a}' test.txt 
awk -va=1 -vb=s '{print $1,$1+a,$1b}' test.txt
```
## 内建变量

### $n

当前记录的第n个字段，字段间由FS分隔

### $0

完整记录

### FS

字段分隔符(默认是任何空格)

### NF

表示一行记录的个数

### NR

表示文本的行数（记录数）

## 实战

### 打印第x列

默认以空格为间隔

```shell
# 打印第1列
awk '{print $1}' test.txt
# 打印第3列
awk '{print $3}' test.txt
# 打印最后1列
awk '{print $NF}' test.txt
# 打印倒数第2列
awk '{print $(NF-1)}' test.txt
```

### 打印本机ip

```shell
# linux查找ip
ifconfig | grep "inet addr:" | grep -v "127.0.0.1" \
| awk '{print $2}' | awk -F"addr:" '{print $2}'

# 将ip的点换成-
xx接上
| awk -F. '{print $1"-"$2"-"$3"-"$4}'
# 一般机房主机名
| awk -F. '{print "xx-WEB"$1"-"$2"-"$3"-"$4".xx.net"}'

# 修改主机名，反引号表示当做一串命令执行
host `ifconfig | grep "inet addr:" | grep -v "127.0.0.1" \
| awk '{print $2}' | awk -F"addr:" '{print $2}' \
| awk -F. '{print "xx-WEB"$1"-"$2"-"$3"-"$4".xx.net"}'`

# mac查找ip
ifconfig | grep "inet " | grep -v "127.0.0.1" \
| awk '{print $2}'
```

# sed

sed 命令是利用脚本来处理文本文件。

注意：**sed里面有变量必须用双引号**

## 语法

```plain
sed [-hnV][-e<script>][-f<script文件>][文本文件]
```
### -i

修改文件内容

```shell
sed -i 's/old/new/2' test.txt  # 不加-i不修改文件内容
```

### s 取代

字符替换

```shell
格式：
s///g 或者 s###g 

# 替换第1个old字符
sed 's/old/new/1' test.txt

# 替换第2个old字符
sed 's/old/new/2' test.txt 

# 全部替换
sed 's/old/new/g' test.txt 
```



```plain
sed -e "0,/\"name\":.*$/s//\"name\": \"$mount_docker_path\"/1" daemon.json
```
问题：
行尾逗号比较难处理

sed参考：

[https://wangchujiang.com/linux-command/c/sed.html](https://wangchujiang.com/linux-command/c/sed.html)

---
categories: ["bigdata"]
tags: ["hdfs"]
title: "HDFS-02基本命令"
# linkTitle: ""
weight: 10
description: >

---

# hdfs dfs与hadoop fs

HDFS的命令实际上和Linux命令相似，基本就是在  `hdfs dfs -` 加上Linux命令即可（  `hdfs dfs -ls /` 和 `hadoop fs -ls /` 效果一样）

# hadoop命令

## 打印配置路径

```shell
hadoop classpath # 打印当前环境的配置路径
```

# HDFS命令

## 查看帮助

```shell
hdfs dfs -help
```

## 查看当前目录信息

```shell
hdfs dfs -ls /
```

## 上传文件

```shell
hdfs dfs -put /local_path /hdfs_path
```

## 剪切文件

```shell
hdfs dfs -moveFromLocal test.txt /test1.txt
```

## 合并下载

```shell
hdfs dfs -getmerge /hdfs_dir /merged_file
```

## 创建文件夹

```shell
hdfs dfs -mkdir /test
```

## 移动文件

```shell
hdfs dfs -mv /hdfs_dir1 /hdfs_dir2
```

## 复制文件

```shell
hdfs dfs -cp /hdfs_dir1 /hdfs_dir2
```

## 删除文件

```shell
hdfs dfs -rm /test.txt
```

## 查看文件

```shell
hdfs dfs -cat /test.txt
hdfs dfs -tail -f /test.txt
```

## 查看文件数量

```shell
hdfs dfs -count /test
```

## 查看空间

```shell
hdfs dfs -df /
hdfs dfs -df -h /
```



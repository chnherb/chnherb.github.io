## find

文件或目录查找

```shell
# 检索当前文件夹
find .  # 同find . -print
# 检索指定文件夹
find dir
# 多个目录
find dir1 dir2
```
### -name

按文件名搜索

```shell
find ./dir -name "test.txt"  # 隐藏文件 ".*"
# 模糊匹配
find ./dir -name "*.txt"
# 忽略大小写
find ./dir -iname "test.txt"
```
### -not或!

```shell
find ./dir -not -name "*.txt" 
# 等同
find ./dir ! -name "*.txt"
# 多条件检索
find ./dir -name 'test' ! -name "*.txt"
```
### -maxdepth

限制目录遍历深度

```shell
find ./dir -maxdepth 2
```

### -type

文件类型

```shell
# 仅查询文件
-type f 
# 仅查询目录
-type d
```
### -perm

访问权限

```shell
find ./dir --perm 0777

# 2>/dev/null 表示去掉“Permission Denied”的条目
find / -maxdepth 2 -perm /u=s 2>/dev/null

# 查找只读文件 
-perm /u=r
# 查找可执行文件 
-perm /a=x
```
### -user

查找属于特定用户

```shell
find dir -user zhangsan
```
### -group

查找属于特定组

```shell
find dir -group zhangsan
```
### -time

基于修改时间的检索

```shell
# 过去N天之内修改的文件
-mtime 10  # +30 30天以前   -1 1天以内
# 过去N天之内访问的文件
-atime 10
```
### -size

基于文件大小检索

```shell
-size 50M
# 大于xx小于xx
-size +50M -size -100M
-size +10k
```

## 高级用法

### xargs

与管道一起用

```shell
# {} 替换前面的输出，"\;"固定格式
|xargs rm -rf {} \;
```
失效情况，不是所有情况都可以用
```shell
|xargs cp {} /tmp/ \;
```
可以换成-exec
### -exec

使用范围更广（推荐），不需要管道

```shell
find . -name "*.txt" -exec cp -r {} /tmp/ \;
# 循环遍历当前目录下最大的5个文件
find . -type f -exec ls -s {} \; | sort -n -r | head -5
```

## 实战

### 将所有文件和目录都恢复成644和755

```shell
find . -type f -exec chmod -R 644 {} \;
find . -type d -exec chmod -R 755 {} \;
```
### 删除30天以前的日志

```shell
find . -type f -name "*.log" -mtime +30 -exec rm -rf {} \;
```



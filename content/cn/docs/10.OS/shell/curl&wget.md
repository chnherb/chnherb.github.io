---
categories: [""] 
tags: [""] 
title: "curl&wget"
# linkTitle: ""
weight: 5
description: >
  
---

## curl

### 语法

```shell
curl [options] [URL...]
```

### 参数说明

#### -d/--data

参数用于发送 POST 请求的数据体。

```plain
curl -d'login=emma＆password=123'-X POST https://google.com/login
# 或者
curl -d 'login=emma' -d 'password=123' -X POST \
https://google.com/login

# 读取data.txt文件的内容发送
curl -d '@data.txt' https://google.com/login
```
1、--data
value如果是@a_file_name，表示数据来自一个文件，文件中的回车符和换行符将被转换

2、--data-ascii <key=value>

完全等价于-d

3) --data-binary key=value

HTTP POST请求中的数据为纯二进制数据

value如果是@file_name，则保留文件中的回车符和换行符，不做任何转换

4) --data-raw key=value

@也作为普通字符串，不会作为文件名给出文件名的标志。即value如果是@file_name，只表示值为“@file_name”的字符串。

其他等价于-d

5) --data-urlencode key=value

基本同-d，区别在于会将发送的数据进行 URL 编码，如空格等

#### **-f/--fail**

禁止服务器在打开页面失败或脚本调用失败时向客户端发送错误说明，取而代之，curl 会返回错误码 22

```shell
# curl -fsSL https://get.docker.com | sh
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

#### -F/--form

模拟表单

```shell
curl -F "image=@./1.png" http:xxx     
# image 相当于<input type='file' name='image'>中name的value，@后面是文件路径
```

#### -H/--header

增加头信息

#### -i

打印出服务器回应的 HTTP 标头。先输出服务器回应的标头，然后空一行，再输出网页的源码。

```plain
curl -i https://www.example.com
```
   
#### -I/--head

向服务器发出 HEAD 请求，然会将服务器返回的 HTTP 标头打印出来。

```plain
curl -I https://www.example.com
```
#### -L/--location

让 HTTP 请求跟随服务器的重定向。curl 默认不跟随重定向。

```plain
curl -L -d 'tweet=hi' https://api.twitter.com/tweet
```

#### -o/--output

将服务器的回应保存成文件，等同于wget命令

```plain
curl -o example.html https://www.example.com
```

#### -O

服务器回应保存成文件，并将 URL 的最后部分当作文件名

```shell
curl -O https://www.example.com/foo/bar.html # 保存为bar.html
```
#### -p/--proxytunnel

#### -s

不输出错误和进度信息

```shell
curl -s https://www.example.com
curl -s -o /dev/null https://google.com
```
#### -S

参数指定只输出错误信息，通常与-o一起使用。

```shell
# 没有任何输出，除非发生错误。
curl -S -o /dev/null https://google.com
```
#### -v/--verbose

显示更多更详细的信息，调试时使用

#### -x

指定 HTTP 请求的代理，如果没有指定代理协议，默认为 HTTP。

```plain
curl -x socks5://james:cats@myproxy.com:8080 https://www.example.com
```

#### -X/--request

指定 HTTP 请求的方法

```plain
curl -X POST https://www.example.com
```

### 实战

#### 连接是否可用

```shell
curl 10.225.147.108:9669/ping/kitex

```
#### 增加header

```shell
curl -H "X-TT-ENV: boe_cloud_toolkits_debug_42" 10.225.147.108:9669/ping/kitex

curl --location --request POST 'https://2ydeg9cx.faas-cn-beijing.byted.org' \
--header 'Token: e144c79a-14e8-4908-9edf-d24e02688b36' \
--header 'X-TT-LOGID: 1234' \
--header 'Content-Type: application/json' \
--data-raw '{
    "language": "c",
    "code": "I2luY2x1ZGUgPHN0ZGlvLmg+CmludCBtYWluKCkKewogICBwcmludGYoIkhlbGxvLCBXb3JsZCBjISIpOwogICByZXR1cm4gMDsKfQ=="
}'

curl -X POST \
'http://dj7biad5.fn-tobboe.bytedance.net' \
-H 'Content-Type:application/json' \
-H 'Token:e144c79a-14e8-4908-9edf-d24e02688b36' \
-H 'X-TT-LOGID:1234567' \
--data '{"language":"c","code":"I2luY2x1ZGUgPHN0ZGlvLmg+CmludCBtYWluKCkKewogICBwcmludGYoIkhlbGxvLCBXb3JsZCBjISIpOwogICByZXR1cm4gMDsKfQ=="}'

fmt.Sprintf("curl -fsSL '%s' -o %s", downloadURL, downloadPath)

curl -i -X POST \
 -H "Content-Type:application/json" \
 -d \
'[
  {
    "type": "store",
    "key": "psmlist",
    "value": 3,
    "Tags": {
      "git": "cli",
      "username": "zhangsan"
    }
  }
]' \
'https://ide-boe.byted.org/ide/api/v1/tools/metrics'
```
#### 上传文件

```shell
cd ${PRODUCT_OUTPUT_DIR} && curl --location --request POST \
'luban-source.byted.org/repository/bytesuite-ftt' \
--form "file=@\"${BUILD_REPO_PACKAGE_NAME}.tar.gz\""
```
### 获取当前机器ip

```shell
curl -s http://ipinfo.io/ip
```


## wget

### 语法说明

### 参数说明

#### -b

后台下载

```shell
wget -b https://xxx/xxx.tar.gz
# 将把输出写入至 wget-log
# 查看下载进度
tail -f wget-log
```
#### -c/--continue

断点续传

对于我们下载大文件时突然由于网络等原因中断非常有帮助，我们可以继续接着下载而不是重新下载一个文件

#### -i

下载多个文件

```shell
cat > filelist.txt 
url1 
url2 
url3 
# 接着使用这个文件和参数-i下载 
wget -i filelist.txt
```
#### -reject

过滤指定格式下载

```shell
wget –reject=gif url   # 过滤gif图片下载某个网站
```
#### -limit-rate

设置下载速率

#### -o

把下载信息存入日志文件而不是显示在终端

```shell
wget -o download.log URL
```
#### -O/--output

下载并以不同文件名保存

下载到对应目录，并且修改文件名称

```shell
wget -O xxx.zip http://xxx/xxx
```
#### -q/--quiet

安静模式（无信息输出）

#### -Q/--quota

设置下载的容量限制

#### -v/--verbose

输出详细信息

### 实战

#### 下载显示进度

```shell
wget -q --show-progress --progress=dot:mega -O targetFilePath url
```
#### 下载重命名

```shell
wget -c -O targetFilePath url
```


## Reference

[curl用法指南](https://www.ruanyifeng.com/blog/2019/09/curl-reference.html)

[curl网站开发指南](https://www.ruanyifeng.com/blog/2011/09/curl.html)

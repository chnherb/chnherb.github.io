

# 背景

写一个自动安装程序的脚本，脚本需要查询接口最近的版本号从而拼接链接去下载固定的版本程序。但是之前解析json用的是jq，有一定的依赖性，虽然针对LInux没有安装jq脚本会帮忙自动安装，但是对于mac或其他平台没有做适配。鉴此，打算增加一个兜底逻辑，没有安装jq就自动解析字符串json

## 
# 目标

解析json数组中第一个对象的固定字段。如下需要解析出"1.0.0.59"：

```json
[{
        "version": "1.0.0.59",
        "arch": [
            "x86_64"
        ],
        "type": "online",
        "create_user": "zhangsan"
},
{
        "version": "1.0.0.58",
        "arch": [
            "x86_64"
        ],
        "type": "online",
        "create_user": "zhangsan"
}
]
```
# 涉及命令

## sed

主要做字符替换

全局字符替换

```shell
sed 's/old_str/new_str/g'
```
## grep

主要负责行查找

## awk

主要做列解析

取第一行

```shell
awk 'NR==1'
```
取第一列
```shell
awk '{print $1}'
```

# 实战

脚本名为：parse_json.sh，文件名为json.txt

## grep处理字符串和文件的区别

首先，解析出version行的内容。

grep处理多行文件和一行文件是有区别的。

**获取version行命令**

```shell
# echo $(cat "json.txt" | grep "version")
cat "json.txt" | grep "version"
```
如处理上文中多行文件输出：
```plain
"version": "1.0.0.59", "version": "1.0.0.58",
```

但如果使用以下命令将文件处理成一行：

```shell
echo $(cat "json.txt") > "json2.txt"
```
然后将执行 “获取version行命令” (修改文件名为json2.txt)
```shell
cat "json2.txt" | grep "version"
```
此时输出的是整个一行文件。问题原因：grep是按行来区分的。
>如果将多行文件内容硬编码在脚本里也是当做一行处理的！！错误效果同上

## sed替换,为多行

解决上面问题需要用到 sed将“,”替换成“\n”，

```shell
cat "json2.txt" | sed 's/,/\\n/g' | grep "version"
```
结果依然是一行文件，原因：grep不能识别其中的换行符。
## echo -e识别换行符

可以借助 echo -e 识别换行符。

```shell
echo -e $(cat "json2.txt" | sed 's/,/\\n/g') | grep "version"
```
或增加中间变量，效果相同：
```shell
s1=$(echo -e $info | sed 's/,/\\n/g')
# echo -e "s1:\n${s1}"
# echo -e "s2:\n$(echo -e $s1 | grep "version")"
echo -e $s1 | grep "version"
```

## 兼容一行或多行

不管一行多行将其先转成一行，在根据“,”转成多行

```shell
echo -e $(cat "json.txt" | sed 's/\\n//g' | sed 's/,/\\n/g') \
| grep "version"
```
这样不管文件内容如何多行或几行串在一行都不会影响最终解析结果，如1，2，3行一行，其余都是一行；或者version跟版本号不在一行 等等情况。
## awk取第一行

不管文件内容如何变动，执行以下命令都能稳定获取结果

```shell
echo -e $(cat "json.txt" | sed 's/\\n//g' | sed 's/,/\\n/g') \
| grep "version" \
| awk 'NR==1'
```
结果为：
```plain
[{ "version": "1.0.0.59"
```

## sed按照:分割成两行

```shell
echo -e $(cat "json.txt" | sed 's/\\n//g' | sed 's/,/\\n/g') \
| grep "version" \
| awk 'NR==1' \
| sed 's/:/\\n/g'
```
删除第一行
```shell
echo -e $(\
    echo -e $(cat "json.txt" | sed 's/\\n//g' | sed 's/,/\\n/g') \
    | grep "version" \
    | awk 'NR==1' \
    | sed 's/:/\\n/g' \
    ) \
| sed '1d'
```
得到：
```shell
 "1.0.0.59"
```
## sed去除"和空格

```shell
echo -e $(\
    echo -e $(cat "json.txt" | sed 's/\\n//g' | sed 's/,/\\n/g') \
    | grep "version" \
    | awk 'NR==1' \
    | sed 's/:/\\n/g' \
    ) \
| sed '1d' \
| sed 's/"/\ /g' \
| sed 's/ //g'
```
得到最终结果
```shell
1.0.0.59
```

## 暴力测试

将json字符串任意换行（不破坏引号内字符串内容），结果都是正确的


# 相关文件

## parse_json.sh

```shell
#!/bin/bash
# set -x 
 
json_content='
[{
        "version": "1.0.0.59",
        "arch": [
            "x86_64"
        ],
        "type": "online",
        "create_user": "zhangsan"
},
{
        "version": "1.0.0.58",
        "arch": [
            "x86_64"
        ],
        "type": "online",
        "create_user": "zhangsan"
}
]'

# 解析文件
echo -e $(\
    echo -e $(cat "json2.txt" | sed 's/\\n//g' | sed 's/,/\\n/g') \
    | grep "version" \
    | awk 'NR==1' \
    | sed 's/:/\\n/g' \
    ) \
| sed '1d' \
| sed 's/"/\ /g' \
| sed 's/ //g'

# 解析字符串，或去掉echo -e $json_content中的-e 表示不转换换行
echo -e $(\
    echo -e $(echo -e $json_content | sed 's/\\n//g' | sed 's/,/\\n/g') \
    | grep "version" \
    | awk 'NR==1' \
    | sed 's/:/\\n/g' \
    ) \
| sed '1d' \
| sed 's/"/\ /g' \
| sed 's/ //g'
```
## json.txt

见本文开头

## json2.txt

```plain
[{   
         "version":
 "1.0.0.59", "arch": [ "x86_64" ], "type": "online", "create_user": "zhangsan" }, { "version": 
 "1.0.0.58", "arch": [ "x86_64" ], "type": "online", 
 "create_user": "zhangsan" } ]
```
## 运行脚本

```shell
bash parse_json.sh
```

# jq解析

## 安装

```shell
brew install jq # 失败可以使用port安装
sudo port install jq

sudo apt-get install jq
```
## 解析json

```shell
cat "json2.txt" | jq -r '.[0].version'

echo $json_content | jq -r '.[0].version'
echo -e $json_content | jq -r '.[0].version'
```

# tips

## sed替换[

```shell
sed 's/[/ /g'  # 可能需要增加个空格？
```




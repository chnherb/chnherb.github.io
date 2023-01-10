# 索引原理

## 倒排索引

倒排索引也叫反向索引，即根据value找key。正向索引则是通过key找value

索引区

根据字段类型存储，如是否分词等

元数据区

记录原始数据

# 分词器

## Analysis和Analyzer

Analysis：文本分析是把全文本转换一系列单词（term/token）的过程，也叫分词（Analyzer）。Analysis是通过Analyzer来实现的。分词就是将文档通过Analyzer分成一个一个的Term（关键词查询），每一个Term都指向包含这个Term的文档

## Analyzer组成

分词器（analyzer）都是由三种构件组成：character filters, tokenizers, token filters

注意：

1、这三种构件顺序是固定的

2、字符过滤器有0个或多个；token过滤器有0个或多个

### 1、character filters

字符过滤器：在一段文本进行分词之前，先进行预处理，比如常见的过滤html标签（<span>hello</span> -> hello），& -> and （I&you -> I and you）等

### 2、tokenizers

分词器：英文分词可以根据空格将单词分开，中文分词比较复杂。

在ES中默认使用标准分词器：StandardAnalyzer。其特点是**中文单字分词，英文单词分词，英文统一转小写，过滤标点符号。**

### 3、token filters

Token过滤器：将切分的单词进行加工。大小写转换，去掉停用词（具体可以自行搜索，像a/and/the等），加入同义词等。

## 内置分词器及测试

### Standard Analyzer

默认分词器，英文按单词切分，并小写处理

```json
POST /_analyze
{
  "analyzer": "standard",
  "text": "this is a dog, 你好呀"
}
```
### Simple Analyzer

按照单词切分（符号被过滤），小写处理，空格分词，中文不分词

```json
POST /_analyze
{
  "analyzer": "simple",
  "text": "this is a dog, 你好呀"
}
```
### Stop Analyzer

小写处理，停用词过滤

### Whitespace Analyzer

按照空格切分，不转小写，不去掉标点符号

```json
POST /_analyze
{
  "analyzer": "whitespace",
  "text": "this is a dog, 你好呀"
}
```
### Keyword Analyzer

不分词，直接将输入当输出

```json
POST /_analyze
{
  "analyzer": "keyword",
  "text": "this is a dog, 你好呀"
}
```
## 创建索引设置分词

```json
# 创建索引并设置分词
PUT /<index>
{
  "settings": {},
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "standard" //显式指定分词器
      }
    }
  }
}
```
## 中文分词器

在ES中支持中文分词器有smartCN、IK等，推荐使用IK分词器

### IK安装

IK分词器并不是官方提供的，需要自动到github下载，地址为：[https://github.com/medcl/elasticsearch-analysis-ik](https://github.com/medcl/elasticsearch-analysis-ik)

注意：

1、IK的版本与ES版本一致

2、Docker容器运行ES安装插件目录为

```shell
/usr/share/elasticsearch/plugins
```
安装步骤：
1、下载对应版本

```shell
wget https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.16.2/elasticsearch-analysis-ik-7.16.2.zip
```
2、解压
```shell
# 安装unzip，如果没有
yum install unzip
unzip elasticsearch-analysis-ik-7.16.2.zip
```
3、移动到ES安装目录的plugins目录中
```shell
mv ik-7.16.2 elasticsearch-7.16.2/plugins/
```
如果是docker-compose，则将修改
```json
volumes:
  data:
  config:
  plugin:
xxxxx
  - plugin:/usr/share/elasticsearch/plugins

# 改成
volumes:
  data:
  config:
  # plugin:
xxxxx
  - ./ik-7.16.2:/usr/share/elasticsearch/plugins/ik-7.16.2
```
### IK使用

IK有两种粒度的拆分

1、ik_smart

会做最粗粒度的拆分

```json
POST /_analyze
{
  "analyzer": "ik_smart",
  "text": "this is a dog, 你好呀"
}
```
2、ik_max_word
会将文本做最细粒度的拆分

```json
POST /_analyze
{
  "analyzer": "ik_max_word",
  "text": "this is a dog, 你好呀"
}
```
## 扩展词、停用词配置

IK分词器config目录下已经定义了一下扩展词如extra_main.dic、和停用词如extra_stopword等。我们可以基于这些词典增加我们的相应词汇。

IK支持自定义扩展词典和停用词典

定义扩展词典和停用词典可以修改IK分词器config目录中 IKAnalyzer.cfg.xml 这个文件

注意，词典的编码一定要为UTF-8才能生效

1、修改 IKAnalyzer.cfg.xml 

```shell
vi IKAnalyzer.cfg.xml 
  <?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
  <properties>
    <comment>IK Analyzer 扩展配置</comment>
    <!-- 配置自定义的扩展词典 -->
    <entry key="ext_dict">ext_dict.dic</entry>
    <!-- 配置停用词典 -->
    <entry key="ext_stopwords">ext_stopword.dic</entry>
```
2、在IK分词器config目录下创建 ext_dict.dic 文件
```shell
vi ext_dict.dic # 加入扩展词即可，每个词一行
```
3、在IK分词器config目录下创建 ext_stopword.dic 文件
```shell
vi ext_stopword.dic # 加入停用词即可，每个词一行
```
4、重启ES


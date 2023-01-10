---
categories: ["full-text search"] 
tags: ["ES"] 
title: "ES基本操作"
# linkTitle: ""
weight: 10
description: >
  
---

# 索引基本操作

注意：

1、索引创建之后不能被修改，只能被删除

2、索引名只能为小写字母

索引有3中状态：红、绿、黄

## 查看索引

```json
# 查看 es 中的索引
GET /_cat/indices
GET /_cat/indices?v  # v表示显示返回结果的标题
```
pri：集群主分片
rep：集群副本分片

docs.count：索引下文档数

docs.deleted：代表删除

store.size：表示存储大小

pri.store.size：表示主分片存储的大小或主索引存储的大小

### 查询索引详细信息

```json
# 自定义标题，如查询索引创建时间
GET /_cat/indices?h=h,s,i,id,p,r,dc,dd,ss,creation.date.string&v
# h表示自定义标题，v表示显示标题
```
其中简写标题对应完整名称，也可以直接使用完整标题替代
h: health

s: status

i: index

id: id

p: pri

r: rep

dc: docs.count

dd: docs.deleted

ss: store.size

cds: creation.date.string


## 创建索引

```json
PUT /<index>  # 默认有主分片和副分片，在同一台机器上会显示为黄，表示备份没有意义

PUT /<index>
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}

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
## 删除索引

```json
DELETE /<index>
```
# 映射基本操作

## 基本类型

字符串类型：keyword/text

数字类型：integer/long

小数类型：float/double

布尔类型：boolean

日期类型：date

## 创建索引&映射

```json
PUT /<index>
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "id": {
        "type": "integer"
      },
      "title": {
        "type": "keyword"
      },
      "price": {
        "type": "double"
      },
      "created_at": {
        "type": "date"
      },
      "description": {
        "type": "text"
      }
    }
  }
}
```
## 查看映射

查看某个索引的映射信息

```json
GET /<index>/_mapping
```
注意：
keyword/integer/long/double/date/boolean/ip 不分词

text类型 默认es标准分词器（StandardAnalyzer），中文单字分词，英文单词分词

# 文档基本操作

## 添加文档

```json
POST /<index>/_doc/1  # 指定文档id
{
  "id": 1,
  "title":"es",
  "price":19.99,
  "created_at":"2021-12-24",
  "description": "this is es"
}

POST /<index>/_doc/1  # 自动创建文档id
{
  "title":"es",
  "price":19.99,
  "created_at":"2021-12-24",
  "description": "this is es"
}
```
## 查询文档

```json
GET /<index>/_doc/<id>
```
## 删除文档

```json
DELETE /<index>/_doc/<id>
```
## 更新文档

```json
# 删除原始文档，然后重新添加，所以要传入全部的字段
PUT /<index>/_doc/<id>
{
  "title":"es2",
  "price":20.12
}

# 基于指定的字段更新
POST /<index>/_doc/<id>/_update
{
  "doc": {
    "title":"es2",
    "price":12.11
  }
}
```
## 文档批量操作

注意：

1、批量操作中，某个操作失败不会影响其他操作，而是继续执行，返回时按照执行的状态返回，即每一条独立执行且返回各自结果

2、语法规定数据不能换行

1、批量添加文档

```json
POST /<index>/_doc/_bulk
{"index":{"_id":2}}
  {"id": 2,"title":"es2","price":29.99,"created_at":"2021-12-22","description": "this is es2"}
{"index":{"_id":3}}
  {"id": 3,"title":"es3","price":39.99,"created_at":"2021-12-23","description": "this is es3"}
```
2、添加、更新、删除
```json
POST /<index>/_doc/_bulk  
{"index":{"_id":4}}
  {"id": 4,"title":"es4","price":49.99,"created_at":"2021-12-24","description": "this is es4"}
{"update":{"_id":3}}
  {"doc":{"title":"es33"}}
{"delete":{"_id":2}}
```

## 文档数量查询

```json
GET /_cat/indices?v
GET _cat/indices/<index>?v
GET /_cat/count/<index>?v
GET _cat/shards/<index>?v
# 聚合统计
GET /<index>/_search
{
    "size" : 0,
    "aggs" : {
        "my_count" : {
            "value_count": {
              "field" : "_id"
            }
        }
    }
}
```

# DSL查询

## 概述

ES中提供了一种强大的检索数据方式，称之为Query DSL(Domain Specified Language)，Query DSL是利用Rest API传递JSON格式的请求体（Request Body）数据与ES进行交互，这种方式的丰富查询语法让ES检索变得更强大、更简洁。

## 语法格式

```json
# GET /索引名/_doc/_search {json格式请求体数据}
# GET /索引名/_search {json格式请求体数据}
# 不加_doc也可以，并且输入查询条件时还会提示
# 增删改时必须加_doc
```
## 返回值

### took

查询时间（请求发出到返回时间），单位毫秒

### timed_out

是否超时

### _shards

当前索引的分片信息

### hits

表示查询结果

#### total

value表示符合条件的总记录数

#### max_score

搜索文档的最大得分

#### hits

结果数据集

_<index>：表示索引

_type：类型，如_doc

_id：文档id

_score：文档得分

_source：文档源数据

## 查询条件

### 查询所有[match_all]

match_all - 返回索引中的全部文档

```json
GET /<index>/_search
{
  "query": {
    "match_all": {}
  }
}
```
### 关键词查询[term]

term - 用来使用关键词查询

这里可以结合_mapping查询字段类型

```json
GET /<index>/_search
{
  "query": {
    "term": {
      "value": 12345
    }
  }
}
# 或
GET /<index>/_search
{
  "query": {
    "term": {
      "id": {
        "value": "12"
      }
    }
  }
}
```
### 范围查询[range]

range - 用来指定查询范围内的文档

gt表示大于，lt表示小于，e表示等于

```json
GET /<index>/_search
{
  "query": {
    "term": {
      "price": {
        "gte": 5,
        "lte": 10
      }
    }
  }
}
```
### 前缀查询[prefix]

prefix - 用来检索含有指定前缀的关键词的相关文档

```json
GET /<index>/_search
{
  "query": {
    "prefix": {
      "description": {
        "value": "this"
value        
      }
    }
  }
}
```
### 通配符查询[wildcard]

wildcard - 通配符查询，? 用来匹配一个任意字符，* 用来匹配多个任意字符

```json
GET /<index>/_search
{
  "query": {
    "wildcard": {
      "description": {
        "value": "this*"     
      }
    }
  }
}
```
### 多id查询[ids]

ids - 值为数组类型，用来根据一组id获取多个对应的文档

```json
GET /<index>/_search
{
  "query": {
    "ids": {
      "values": [1,3,5]
    }
  }
}
```
### 模糊查询[fuzzy]

fuzzy - 用来模糊查询含有指定关键字的文档

```json
GET /<index>/_search
{
  "query": {
    "fuzzy": {
      "description": "hello"
    }
  }
}
```
注意：
模糊查询最大模糊错误必须在0-2之间

* 搜索关键词长度为2不允许存在模糊
* 搜索关键词长度为3-5允许一次模糊
* 搜索关键词长度大于5允许最大2模糊

### 布尔查询[bool]

bool - 用来组合多个条件实现复杂查询

must：相当于 && 同时成立

should：相当于 || 成立一个就行

must_not：相当于 ! 不能满足任何一个

```java
GET /<index>/_search
{
  "query": {
    "bool": {
      "must": [
      {
        "term": {
          "price": {
            "value": 10
          }
        }
      },{
        "term": {
          "id": {
            "value": 1
          }
        }
      }
      ]
    }
  }
}
```
### 多字段查询[multi_match]

```json
GET /<index>/_search
{
  "query": {
    "multi_match": {
      "query": "hello",
      "fields": ["title", "description"]
    }
  }
}
```
注意：字段类型分词，将查询条件分词之后进行查询该字段，字段不分词则会将查询条件作为整体查询
### 默认字段分词查询[query_string]

```json
GET /<index>/_search
{
  "query": {
    "query_string": {
      "default_field": "description",
      "query": "very good"
    }
  }
}
```
注意：查询字段分词就将查询条件分词查询，查询字段不分词将查询条件不分词查询
### 高亮查询[highlight]

highlight - 让符合条件的文档中的关键词高亮（有点类似 grep 的 color）

只有可分词的字段才会高亮，"*"表示所有字段高亮

```json
GET /<index>/_search
{
  "query": {
    "query_string": {
      "default_field": "description",
      "query": "very good"
    }
  },
  "highlight": {
    "fields": {
      "pre_tags": ["<span style='color:red;'>"],
      "post_tags": ["</span>"],
      "require_field_match": false, # 关闭搜索字段的验证，才能实现全部字段的高亮
      "*": {} # 或 {"description":{}, "title":{}} 等
    }
  }
}
```
查询结果中，hits数组中会多个"highlight"字段，默认高亮关键会使用<em></em>修饰（表示斜体）。
如果觉得这种修饰方法不太直接，可以将结果"highlight"内容保存至html文件，然后用浏览器打开。

```xml
<style type="text/css">
  em {
    color: red;
  }
</style>
那些<em>可爱</em>的<em>人</em>
```
或者指定标签：pre_tags和post_tags，内容如上查询demo
### 返回指定条数[size]

size - 指定查询中的返回条数，默认返回值10条

```json
GET /<index>/_search
{
  "query": {
    "match_all": {}
  },
  "size": 5
}
```
### 分页查询[from]

from - 用来指定其实返回位置，和size关键字连用可实现分页效果

```json
GET /<index>/_search
{
  "query": {
    "match_all": {}
  },
  "from": 0,
  "size": 5
}
```
### 指定字段排序[sort]

```json
GET /<index>/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
  {
    "price": {
      "order": "desc"
    }
  }
  ]
}
```
### 返回指定字段[_source]

_source - 在数组中指定返回字段

```json
GET /<index>/_search
{
  "query": {
    "match_all": {}
  },
  "_source": ["title", "description"]
}
```

# 过滤查询

## 概述

过滤查询（filter query），准确来说，ES中的查询操作分为2种：查询（query）和过滤（filter）。

查询即是上文提到的query查询，默认会计算每个返回文档的得分排序。

过滤（filter）只会筛选出符合条件的文档，并不计算得分，而且它可以缓存文档。

单从性能上分析，过滤比查询块。过滤适合在大范围筛选数据，而查询适合精确匹配数据。一般应用时应先使用过滤操作过滤数据，然后查询匹配数据。

## filter使用

先执行filter，再执行query。

ES会自动缓存经常使用的过滤器，以加快性能。

filter需要配置bool查询

```json
GET /<index>/_search
{
  "query": {
    "bool": {
      "must": [
        {"match_all": {}} // 查询条件
      ],
      "filter": {} // 过滤条件
    }
  }
}
```
常见的过滤类型有：term、terms、range、exists、ids等
### terms

```json
GET /<index>/_search
{
  "query": {
    "bool": {
      "must": [
        {"match_all": {}} // 查询条件
      ],
      "filter": {
        "terms": {
          "description": [
          "中国",
          "我们"
          ]
        }
      } // 过滤条件
    }
  }
}
```

# post_filter

待补充

```json
{
  "query": {
    "match_all": {}
  },
  "post_filter":{
        "match_phrase":{
            "categories":{
                "query":"debuggers",
                "slop":0,
                "zero_terms_query":"NONE",
                "boost":1
            }
        }
    }
}
```

# 聚合查询

聚合查询（Aggregation Aggs），是ES除搜索功能外提供的针对ES数据做统计分析的功能。基于查询条件来对数据进行分桶、计算的方法。类似于SQL中的 group by 等一些操作。

## 分组

根据某个字段进行分组，统计数量

```json
GET /<index>/_search
{
  "query": {
    "term": {
      "description": {
        "value": "中国"
      }
    }
  },
  "aggs": {
    "price_group": {
      "terms": {
        "field": "price"
      }
    }
  }
}
```
## 最大值

```json
GET /<index>/_search
{
  "aggs": {
    "price_max": {
      "max": {
        "field": "price"
      }
    }
  }
}
```
## 最小值

```json
GET /<index>/_search
{
  "aggs": {
    "price_min": {
      "min": {
        "field": "price"
      }
    }
  }
}
```
## 平均值

```json
GET /<index>/_search
{
  "aggs": {
    "price_avg": {
      "avg": {
        "field": "price"
      }
    }
  }
}
```
## 求和

```json
GET /<index>/_search
{
  "aggs": {
    "price_sum": {
      "sum": {
        "field": "price"
      }
    }
  }
}
```

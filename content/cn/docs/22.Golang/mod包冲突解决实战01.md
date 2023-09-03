---
categories: ["Golang"]
tags: ["mod"]
title: "mod包冲突解决实战01"
# linkTitle: ""
weight: 30
description: >

---



# 背景

Go升级包之后编译报错

# 常用命令

```shell

go mod tidy

go mod why xxx包

go list -m -versions xx包

$ go mod help
Usage:

        go mod <command> [arguments]

The commands are:

        download    download modules to local cache
        edit        edit go.mod from tools or scripts
        graph       print module requirement graph
        init        initialize new module in current directory
        tidy        add missing and remove unused modules
        vendor      make vendored copy of dependencies
        verify      verify dependencies have expected content
        why         explain why packages or modules are needed

```


# 分析过程

## 错误1

```go
$ go mod tidy
code.byted.org/life/poi_api/pack imports
        code.byted.org/life/schema_builder/builder tested by
        code.byted.org/life/schema_builder/builder.test imports
        code.byted.org/aweme/goprofile_api/clients imports
        code.byted.org/ucenter/act_passport_lib imports
        code.byted.org/luckycat/activity_common_util/settings imports
        code.byted.org/luckycat/activity_common_util/byteconf imports
        code.byted.org/ttarch/byteconf_sdk imports
        code.byted.org/toutiao/conf_middleground_json_engine_lib/model/celconf imports
        github.com/google/cel-go/cel imports
        github.com/google/cel-go/parser imports
        github.com/antlr/antlr4/runtime/Go/antlr: ambiguous import: found package github.com/antlr/antlr4/runtime/Go/antlr in multiple modules:
        github.com/antlr/antlr4 v0.0.0-20200503195918-621b933c7a7f (/Users/admin/go/pkg/mod/github.com/antlr/antlr4@v0.0.0-20200503195918-621b933c7a7f/runtime/Go/antlr)
        github.com/antlr/antlr4/runtime/Go/antlr v0.0.0-20210521184019-c5ad59b459ec (/Users/admin/go/pkg/mod/github.com/antlr/antlr4/runtime/!go/antlr@v0.0.0-20210521184019-c5ad59b459ec)
```

## 解决1

分析：尝试升级 cel-go 依赖库

```shell
$ go get github.com/google/cel-go
```
然后 go mod tidy，提示
```shell
To upgrade to the versions selected by go 1.16:
        go mod tidy -go=1.16 && go mod tidy -go=1.17
If reproducibility with go 1.16 is not needed:
        go mod tidy -compat=1.17
For other options, see:

```
便执行
```shell
go mod tidy -go=1.16 && go mod tidy -go=1.17
```

## 错误2

编译报错：

```shell
2023/09/03 16:20:41 ../compile_path/pkg/mod/code.byted.org/iesarch/samsarahq_thunder@v0.0.0-20230227104850-d8b99a2a24a4/graphql/directive.go:141:55: cannot use NewMultiMapParameters(expressArguments, r.E.AssignData, r.E.RawData, sourceMap) (type MultiMapParameters) as type govaluate.MapParameters in argument to expression.Eval
499
2023/09/03 16:20:41 ../compile_path/pkg/mod/code.byted.org/iesarch/samsarahq_thunder@v0.0.0-20230227104850-d8b99a2a24a4/graphql/eval_calculator.go:32:48: cannot use NewMultiMapParameters(m...) (type MultiMapParameters) as type govaluate.MapParameters in argument to e.expression.Eval
500
2023/09/03 16:20:41 ../compile_path/pkg/mod/code.byted.org/iesarch/samsarahq_thunder@v0.0.0-20230227104850-d8b99a2a24a4/graphql/resolver.go:408:55: cannot use NewMultiMapParameters(expressArguments, r.E.AssignData, r.E.RawData, sourceMap) (type MultiMapParameters) as type govaluate.MapParameters in argument to expression.Eval
501
2023/09/03 16:20:49 # code.byted.org/eventbus/client-go/discovery
```

## 解决2

通过报错信息可以发现 code.byted.org/iesarch/samsarahq_thunder 依赖 code.byted.org/whale/govaluate 包，但出现参数不匹配的问题。

对比之前master代码，发现 code.byted.org/iesarch/samsarahq_thunder 版本无变化，code.byted.org/whale/govaluate 版本由 v1.0.1 升级到了 v1.0.5（也可以查看该包所有版本）。顾降级该版本。

```shell
replace code.byted.org/whale/govaluate => code.byted.org/whale/govaluate v1.0.1
```

重新执行：

```shell
go mod tidy
```
然后重新编译
## 错误3

```shell
2023/09/03 16:50:14 + go build -mod=mod -o data.life.poi_api -opt=beast
497
2023/09/03 16:50:50 # code.byted.org/eventbus/client-go/discovery
498
2023/09/03 16:50:50 ../compile_path/pkg/mod/code.byted.org/eventbus/client-go@v1.10.1/discovery/consul_resolver.go:48:8: invalid argument cluster (type func() string) for len
499
2023/09/03 16:50:50 ../compile_path/pkg/mod/code.byted.org/eventbus/client-go@v1.10.1/discovery/consul_resolver.go:49:11: cannot use defaultCluster (type string) as type func() string in assignment
500
2023/09/03 16:50:50 ../compile_path/pkg/mod/code.byted.org/eventbus/client-go@v1.10.1/discovery/consul_resolver.go:54:26: cannot use cluster (type func() string) as type string in argument to newConsulResolver
```

## 解决3

分析 code.byted.org/eventbus/client-go 原来master代码是 v1.10.1，现在的版本还是一样，查找该包所有版本：

```shell
go list -m -versions code.byted.org/eventbus/client-go
```
也可直接升级到最新版本：
```shell
go get code.byted.org/eventbus/client-go
```
查看mod文件升级到 v1.13.5，然后tidy之后重新编译。
## 问题4

```shell
# code.byted.org/eventbus/client-go/discovery
/home/byteide/go/pkg/mod/code.byted.org/eventbus/client-go@v1.10.1/discovery/consul_resolver.go:48:8: invalid argument cluster (type func() string) for len
/home/byteide/go/pkg/mod/code.byted.org/eventbus/client-go@v1.10.1/discovery/consul_resolver.go:49:11: cannot use defaultCluster (type string) as type func() string in assignment
/home/byteide/go/pkg/mod/code.byted.org/eventbus/client-go@v1.10.1/discovery/consul_resolver.go:54:26: cannot use cluster (type func() string) as type string in argument to newConsulResolver
# github.com/mattn/go-sqlite3
sqlite3-binding.c: In function ‘sqlite3SelectNew’:
sqlite3-binding.c:128049:10: warning: function may return address of local variable [-Wreturn-local-addr]
128049 |   return pNew;
       |          ^~~~
sqlite3-binding.c:128009:10: note: declared here
128009 |   Select standin;
```

## 解决4

参考：

>[https://github.com/mattn/go-sqlite3/issues/822](https://github.com/mattn/go-sqlite3/issues/822)
>[https://github.com/mattn/go-sqlite3/issues/803](https://github.com/mattn/go-sqlite3/issues/803)

查看 

```shell
$ go env | grep -i CGO_CFLAGS
CGO_CFLAGS="-g -O2"
```
解决：
```shell
CGO_CFLAGS="-g -O2 -Wno-return-local-addr" bash build.sh
```


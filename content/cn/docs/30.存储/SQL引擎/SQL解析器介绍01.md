---
categories: [""]
tags: [""]
title: "SQL解析器介绍01"
# linkTitle: ""
weight: 10
description: >

---

# 背景

传统的关系型数据库都支持 SQL 查询，另外在大数据领域，为了降低大数据的学习成本和难度方便用户，都开始支持 SQL 查询。SQL 查询让更多的用户可以方便快捷地查询数据，极大降低了学习门槛。

# 解析流程

通常解析器主要包括：

* 词法解析
* 语法解析
* 语义解析
## 词法解析

根据构词规则识别字符并切割成一个个的词条，如遇到空格进行分割，遇到分号时结束词法解析。

## 语法解析

语法分析的任务会在词法分析的结果上将词条序列组合成不同语法短句，组成的语法短句将与相应的语法规则进行适配，若适配成功则生成对应的抽象语法树，否则报会抛出语法错误异常。

## 语义解析

语义分析的任务是对语法解析得到的抽象语法树进行有效的校验，比如字段、字段类型、函数、表等进行检查。

# 常用SQL解析器

**C/C++中，可以使用 LEX 和 YACC 来做词法分析和语法分析；Java中，可以使用 JavaCC 或 ANTLR** 。

# ANTLR

ANTLR是一款功能强大的语法分析器生成器，几乎支持所有主流变成语言的解析（[antlr/grammars-v4](https://github.com/antlr/grammars-v4)）。可以用来读取、处理、执行和转换结构化文本或者二进制文件。在大数据的一些SQL框架里面有有广泛的应用，比如Hive的词法文件是ANTLR3写的，Presto词法文件也是ANTLR4实现的，SparkSQLambda词法文件也是用Presto的词法文件改写的，另外还有HBase的SQL工具Phoenix也是用ANTLR工具进行SQL解析的。

## 执行过程

* 实现词法文件（.g4）
* 生成词法分析器和语法分析器
* 生成抽象语法书（AST）
* 遍历AST，生成语义树
* 访问统计信息
* 生成逻辑执行计划
* 生成物理执行计划
## Parser

Parser用来识别语言程序，包括两个部分：

* 词法分析器：关键字、标识符；
* 语法分析器：基于词法分析结果构造语法分析树。
转换过程：

* 字符流
* Token流
* （语法分析树）非叶子节点
* （语法分析树）叶子结点
## Grammar

ANTLR提供了很多常用语言的语法文件（[antlr/grammars-v4](https://github.com/antlr/grammars-v4)）。

使用语法注意事项：

* 语法名称和文件名要一致
* 语法分析器规则以小写字母开始
* 词法分析器规则以大写字母开始
* 用'string'单引号引出字符串
* 不需要指定开始符号
* 规则以分号结束
## 实现四则运算

实现的基本流程：

1. 按照ANTLR4的规则编写自定义语法的语义规则, 保存成以g4为后缀的文件；
2. 使用ANTLR4工具处理g4文件，生成词法分析器、句法分析器代码、词典文件；
3. 编写代码继承Visitor类或实现Listener接口，开发自己的业务逻辑代码。
一般有两种模式：

* Visitor模式
```shell
antlr4 -package com.chnherb.sql -no-listener -visitor .\xxx.g4
```
* Listener模式
```shell
antlr4 -package com.chnherb.sql -listener .\xxx.g4
```

### 定义词法规则文件

CommonLexerRules.g4

```plain
// 定义词法规则
lexer grammar CommonLexerRules;
 
//////// 定义词法
// 匹配ID
ID     : [a-zA-Z]+ ;
// 匹配INT
INT    : [0-9]+    ;
// 匹配换行符
NEWLINE: '\n'('\r'?);
// 跳过空格、跳格、换行符
WS     : [ \t\n\r]+ -> skip;
 
//////// 运算符
DIV:'/';
MUL:'*';
ADD:'+';
SUB:'-';
EQU:'=';
```

### 定义语法规则文件

LibExpr.g4

```plain

// 定于语法规则
grammar LibExpr;
 
// 导入词法规则
import CommonLexerRules;
 
// 词法根
prog:stat+ EOF?;
 
// 定义声明
stat:expr (NEWLINE)?         # printExpr
    | ID '=' expr (NEWLINE)? # assign
    | NEWLINE                # blank
    ;
 
// 定义表达式
expr:expr op=('*'|'/') expr # MulDiv
    |expr op=('+'|'-') expr # AddSub
    |'(' expr ')'           # Parens
    |ID                     # Id
    |INT                    # Int
    ;
```

### 编译生成文件

```xml
<dependencies>
    <dependency>
        <groupId>org.antlr</groupId>
        <artifactId>antlr4</artifactId>
        <version>4.9.3</version>
    </dependency>
    <dependency>
        <groupId>org.antlr</groupId>
        <artifactId>antlr4-runtime</artifactId>
        <version>4.9.3</version>
    </dependency>
</dependencies>
```
执行命令：
```shell
mvn generate-sources
```

### 编写示例代码

示例文本：

```plain
1+2
1+2*3
1+2*3-4
1+2*3-4+20/5
(1+2)*3
```
逻辑代码：
```java
package com.chnherb.sql;
import java.util.HashMap;
import java.util.Map; 
/**
 * 重写访问器规则，实现数据计算功能
 * 目标：
 *     1+2 => 1+2=3
 *     1+2*4 => 1+2*4=9
 *     1+2*4-5 => 1+2*4-5=4
 *     1+2*4-5+20/5 => 1+2*4-5+20/5=8
 *     (1+2)*4 => (1+2)*4=12
 */
public class LibExprVisitorImpl extends LibExprBaseVisitor<Integer> {
    // 定义数据
    Map<String,Integer> data = new HashMap<String,Integer>();
    // expr (NEWLINE)?         # printExpr
    @Override
    public Integer visitPrintExpr(LibExprParser.PrintExprContext ctx) {
        System.out.println(ctx.expr().getText()+"="+visit(ctx.expr()));
        return visit(ctx.expr());
    }
    // ID '=' expr (NEWLINE)? # assign
    @Override
    public Integer visitAssign(LibExprParser.AssignContext ctx) {
        // 获取id
        String id = ctx.ID().getText();
        // // 获取value
        int value = Integer.valueOf(visit(ctx.expr()));
        // 缓存ID数据
        data.put(id,value);
        // 打印日志
        System.out.println(id+"="+value);
        return value;
    } 
    // NEWLINE                # blank
    @Override
    public Integer visitBlank(LibExprParser.BlankContext ctx) {
        return 0;
    }
    // expr op=('*'|'/') expr # MulDiv
    @Override
    public Integer visitMulDiv(LibExprParser.MulDivContext ctx) {
        // 左侧数字
        int left = Integer.valueOf(visit(ctx.expr(0)));
        // 右侧数字
        int right = Integer.valueOf(visit(ctx.expr(1)));
        // 操作符号
        int opType = ctx.op.getType();
        // 调试
        // System.out.println("visitMulDiv>>>>> left:"+left+",opType:"+opType+",right:"+right);
        // 判断是否为乘法
        if(LibExprParser.MUL==opType){
            return left*right;
        }
        // 判断是否为除法
        return left/right;
 
    }
 
    // expr op=('+'|'-') expr # AddSub
    @Override
    public Integer visitAddSub(LibExprParser.AddSubContext ctx) {
        // 获取值和符号
        // 左侧数字
        int left = Integer.valueOf(visit(ctx.expr(0)));
        // 右侧数字
        int right = Integer.valueOf(visit(ctx.expr(1)));
        // 操作符号
        int opType = ctx.op.getType();
        // 调试
        // System.out.println("visitAddSub>>>>> left:"+left+",opType:"+opType+",right:"+right);
        // 判断是否为加法
        if(LibExprParser.ADD==opType){
            return left+right;
        }
        // 判断是否为减法
        return left-right;
    }
    // '(' expr ')'           # Parens
    @Override
    public Integer visitParens(LibExprParser.ParensContext ctx) {
        // 递归下调
        return visit(ctx.expr());
    } 
    // ID                     # Id
    @Override
    public Integer visitId(LibExprParser.IdContext ctx) {
        // 获取id
        String id = ctx.ID().getText();
        // 判断ID是否被定义
        if(data.containsKey(id)){
            // System.out.println("visitId>>>>> id:"+id+",value:"+data.get(id));
            return data.get(id);
        }
        return 0;
    }
    // INT                    # Int
    @Override
    public Integer visitInt(LibExprParser.IntContext ctx) {
        // System.out.println("visitInt>>>>> int:"+ctx.INT().getText());
        return Integer.valueOf(ctx.INT().getText());
    }
}
```

Main函数：

```java
package com.chnherb.sql;
import org.antlr.v4.runtime.tree.ParseTree;
import java.io.FileNotFoundException;
import java.io.IOException;
import org.antlr.v4.runtime.*;
/**
 * 打印语法树
 */
public class TestLibExprPrint {
    // 打印语法树 input -> lexer -> tokens -> parser -> tree -> print
    public static void main(String args[]){
        printTree("./testCase.txt");
    }
    /**
     * 打印语法树 input -> lexer -> token -> parser -> tree
     * @param fileName
     */
    private static void printTree(String fileName){
        // 定义输入流
        ANTLRInputStream input = null; 
        // 判断文件名是否为空,若不为空，则读取文件内容，若为空，则读取输入流
        if(fileName!=null){
            try{
                input = new ANTLRFileStream(fileName);
            }catch(FileNotFoundException fnfe){
                System.out.println("文件不存在，请检查后重试！");
            }catch(IOException ioe){
                System.out.println("文件读取异常，请检查后重试！");
            }
        }else{
            try{
                input = new ANTLRInputStream(System.in);
            }catch(FileNotFoundException fnfe){
                System.out.println("文件不存在，请检查后重试！");
 
            }catch(IOException ioe){
                System.out.println("文件读取异常，请检查后重试！");
            }
        }
        // 定义词法规则分析器
        LibExprLexer lexer = new LibExprLexer(input);
        // 生成通用字符流
        CommonTokenStream tokens = new CommonTokenStream(lexer);
        // 语法解析
        LibExprParser parser = new LibExprParser(tokens);
        // 生成语法树
        ParseTree tree = parser.prog();
        // 打印语法树
        // System.out.println(tree.toStringTree(parser));
        // 生命访问器
        LibExprVisitorImpl visitor = new LibExprVisitorImpl();
        visitor.visit(tree);
    }
}
```

# Calcite

## 简介

与ANTLR不同，Apache Calcite大大简化了SQL的解析流程，不需要定义接口、生成代码。

数据库包含的常用功能：

* query language
* query optimization
* query execution
* data management
* data storage
Calcite 设计之初主要关注前三者，将后面两个数据管理和数据存储交给计算/存储引擎。专注于上层通用的模块，控制系统的复杂性。

同时，Calcite也复用了一些组件，如使用 JavaCC 来将SQL语句转为Java代码，进而转化成AST。另外为了支持灵活的元数据功能，Calcite需要支持运行时编译Java代码，但默认的JavaC太重，使用了轻量开源的 Janino。

常用的大数据组件都有集成 Calcite，Hive就是自己做了SQL解析，只使用了Calcite的查询优化功能。而像Flink从解析到优化都直接使用了Calcite。

## 主要模块

* JDBC Client：支持 JDBC Client 的应用
* SQL Parser and Validator：用来SQL解析和校验
* Expressions Builder：支持SQL解析和校验的框架对接
* Operator Expressions：处理关系表达式
* Metadata Provider：支持外部自定义元数据
* Pluggable Rules：定义优化规则
* Query Optimizer：（核心模块）专注于查询优化
## 解析SQL

### pom依赖

```xml
<dependencies>
  <dependency>
    <groupId>org.smartloli</groupId>
    <artifactId>jsql-client</artifactId>
    <version>1.0.0</version>
  </dependency>
</dependencies>
```
### 实现代码

```java
package com.chnherb.sql;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.smartloli.util.JSqlUtils;

public class JSqlClient {
    public static void main(String[] args) {
        JSONObject tabSchema = new JSONObject();
        tabSchema.put("id","integer");
        tabSchema.put("name","varchar");

        JSONArray datasets = JSON.parseArray("[{\"id\":1,\"name\":\"aaa\",\"age\":20},{\"id\":2,\"name\":\"bbb\",\"age\":21},{\"id\":3,\"name\":\"ccc\",\"age\":22}]");
        String tabName = "userinfo";
        String sql = "select count(*) as cnt from \"userinfo\"";
        try{
           String result = JSqlUtils.query(tabSchema,tabName,datasets,sql);
            System.out.println("result: "+result);
        }catch (Exception e){
            e.printStackTrace();
        }
    }
}
```

# Reference

[https://github.com/antlr/antlr4](https://github.com/antlr/antlr4)

[https://github.com/antlr/grammars-v4](https://github.com/antlr/grammars-v4)

[https://github.com/apache/calcite](https://github.com/apache/calcite)

[https://github.com/smartloli/EFAK](https://github.com/smartloli/EFAK)

[探究Presto SQL引擎(1)-巧用Antlr](https://mp.weixin.qq.com/s/oYsCmTg4OVlIuB9a8Eu1Vw)

[如何实现一个SQL解析器](https://mp.weixin.qq.com/s/2FH4WuO1FMbxqiv4RUvdrA)




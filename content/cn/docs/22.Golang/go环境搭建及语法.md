---
categories: ["Golang"] 
tags: [""] 
title: "go环境搭建及语法"
# linkTitle: ""
weight: 5
description: >
  
---

>go语言基础的环境搭建和语法

Go开发包网站

[https://pkg.go.dev/unicode/utf8](https://pkg.go.dev/unicode/utf8)

## 基本概念

### go root

golang 的安装路径，一般为/usr/local/go

### go path

个人工作路径，如/Users/admin/go_project/

```shell
# 查看go版本
go version

# 查看go环境
go env
// 如上go root和go path路径等

# 设置go工作路径
go env -w GOPATH=/Users/bo/go_project/

go env -w GOPROXY=https://goproxy.cn,direct
// 私有仓库
go env -w GOPRIVATE=*.gitlab.com,*.gitee.com
```

go代理

网站：goproxy.io

```shell
export GOPROXY=https://goproxy.io,direct
export GOPRIVATE=git.mycompany.com,github.com/my/private
```


## hello world

go_project // (go_project为GOPATH目录)

-- bin // golang编译可执行文件存放路径

-- pkg // golang编译包时，生成的.a文件存放路径

-- src // 源码路径。按照golang默认约定，go run，go install等命令的当前工作路径（即在此路径下执行上述命令）。

目录：/Users/bo/go_project/src/go_code/project01/main

创建hello.go

```go
package main

import "fmt"

func main() {
    fmt.Println("hello")
}
```
### 创建mod

```shell
go mod init go-hello
# go mod init github.com/rocksun/hellogo
```
### 运行程序

```shell
go run main.go

go run ./ -v deploy
```
### 编译程序

```shell
# /Users/admin/go_project/src/go_code/hello_word/main
# 编译
go build go_code/hello_word/main
# 或 
go build hello.go
# 执行
./go_code/hello_word/main/hello
# 指定名称编译
go build -o myhello hello.go
```
格式化
```plain
gofmt -w hello.go
```
git下载包出现ssl问题：OpenSSL SSL_connect: SSL_ERROR_SYSCALL in connection to github.com:443
解决办法：取消http代理

```shell
git config --global --unset http.proxy
```
## 包导入

```go
// import f "fmt" // 用别名f 代替 fmt
// import . "fmt"
// import _ "xxx" //包的匿名导入，只为了执行其init函数
// f.Println("go go go") // 用 f 代替了 fmt 调用 Println 函

// 路径导入，gopath
import "go_code/hello_world/mathutil"
```
绝对导入
相对导入

相对导入，有两点需要注意

* 项目不要放在 `$GOPATH/src` 下，否则会报错（比如我修改当前项目目录为GOPATH后，运行就会报错）
* Go Modules 不支持相对导入，在你开启 GO111MODULE 后，无法使用相对导入。
当我们导入一个包时，它会：

1. 先从项目根目录的 xxx 目录中查找
2. 最后从 `$GOROOT/src` 目录下查找
3. 然后从 `$GOPATH/src` 目录下查找
4. 都找不到的话，就报错。
你导入的包如果有域名，都会先在 `$GOPATH/pkg/mod` 下查找，找不到就连网去该网站上寻找，找不到或者找到的不是一个包，则报错。

而如果你导入的包没有域名（比如 "fmt"这种），就只会到 `$GOROOT` 里查找。


# go模块

* `go mod init` 创建了一个新的模块，初始化 `go.mod` 文件并且生成相应的描述
* `go build, go test` 和其它构建代码包的命令，会在需要的时候在 `go.mod` 文件中添加新的依赖项
* `go list -m all` 列出了当前模块所有的依赖项
* `go get` 修改指定依赖项的版本（或者添加一个新的依赖项）
* `go mod tidy` 移除模块中没有用到的依赖项。
 

当前目录/User/bo/hello，非$GOPATH

```go
// hello.go
package hello
func Hello() string {
  return "Hello, world."
}

// hello_test.go
package hello
import "testing"
func TestHello(t *testing.T) {
    want := "Hello, world."
    if got := Hello(); got != want {
        t.Errorf("Hello() = %q, want %q", got, want)
    }
}
```
## go mod init

```shell
go mod init example.com/hello  // 1

# 切到go.mod目录下，即自动下载依赖包到pkg/mod/cache/download
go mod download
```
## 启动go mod路径导入会报错

解决办法：

```shell
// 切换至项目目录，如hello_world目录下
go mod init hello_world
// 导入路径从 import "go_code/hello_world/mathutil"改成
import "hello_world/mathutil"
```
注意如果还报错，重启下IDE即可，或者修改下文件，这只是IDE刷新的问题
## go test

```shell
go test

// cat go.mod
// cat go.sum
```
>`go.mod` 文件只存在于模块的根目录中。模块子目录的代码包的导入路径等于模块根目录的导入路径（就是前面说的 module path）加上子目录的相对路径。比如，我们如果创建了一个子目录叫 `world`，我们不需要（也不会想要）在子目录里面再运行一次 `go mod init` 了，这个代码包会被认为就是 `example.com/hello` 模块的一部分，而这个代码包的导入路径就是 `example.com/hello/world`。 
>除了 `go.mod` 之外，go 命令行工具还维护了一个 `go.sum` 文件，它包含了指定的模块的版本内容的哈希值作为校验参考： 

## go list

把当前的模块和它所有的依赖项都列出来

```shell
go list -m all

go list -m -versions rsc.io/sampler
```
>在上述 `go list` 命令的输出中，当前的模块，又称为主模块 (main module)，永远都在第一行，接着是主模块的依赖项，以依赖项的 module path 排序。 

## go get

go get会做两件事：

1. 从远程下载需要用到的包

2. 执行go install

```shell
go get  // 拉所有包
go get golang.org/x/text
go get rsc.io/sampler@v1.3.1  // 默认情况下这个版本号是 @latest
```
## go install

go install 会生成可执行文件直接放到bin目录下，当然这是有前提的

你编译的是可执行文件，如果是一个普通的包，会被编译生成到pkg目录下该文件是.a结尾

## go mod

清除这些没用到的依赖项

```shell
go mod tidy
```
下载依赖
```shell
go mod download
```


# 基础语法

1、golang的命名推荐使用驼峰命名法，必须以一个字母（Unicode字母）或下划线开头，后面可以跟任意数量的字母、数字或下划线。

2、golang中根据首字母的大小写来确定可以访问的权限。无论是方法名、常量、变量名还是结构体的名称，如果首字母大写，则可以被其他的包访问；如果首字母小写，则只能在本包中使用

3、结构体中属性名的大写

如果属性名小写则在数据解析（如json解析,或将结构体作为请求或访问参数）时无法解析

## 声明

### 变量的定义

```go
var a int
var b float32
var c, d float64
e, f := 9, 10   // 使用:=这个符号。使用了这个符号之后，开发者不再需要写var关键字，只需要定义变量名，并在后面进行赋值即可
var g = "Ricardo"  // 在变量的定义过程中，如果定义的时候就赋予了变量的初始值，是不需要再声明变量的类型的
```
### 匿名变量

不需要用的变量都可以用_表示，可以多个，如：

```go
_, v, _ := getData()
```
### 常量

在Golang的常量定义中，使用`const`关键字，并且**不能**使用`:=`标识符。 

## 判断

## 循环

## 函数

### defer

defer 语句会将函数推迟到外层函数返回之后执行。 推迟调用的函数其参数会立即求值，但直到外层函数返回前该函数都不会被调用。

>注意，defer后面必须是函数调用语句，不能是其他语句，否则编译器会报错。

可以考虑到的场景是，文件的关闭，或数据库连接的释放等，这样打开和关闭的代码写在一起，既可以使得代码更加的整洁，也可以防止出现开发者在写了长长的业务代码后，忘记关闭的情况。

 至于defer的底层实现，本文不进行详细的解释，简单来讲就是将defer语句后面的函数调用的地址压进一个栈中，在当前的函数执行完毕，CPU即将执行函数外的下一行代码之前，先把栈中的指令地址弹出给CPU执行，直到栈为空，才结束这个函数，继续执行后面的代码。

## 指针

>但是，与 C 不同，Golang没有指针运算。

## 数组

```go
var a [10]int

str := [4]string{
	    "aaa",
	    "bbb",
	    "ccc",
	    "ddd",
	}
```
>注意，在Golang中，数组的大小也同样和 C 语言一样不能改变。

### 切片

```go
a[low : high]  // 会选择一个半开区间，包括第一个元素，但排除最后一个元素。
```

>Golang中的切片，不是拷贝，而是定义了新的指针，指向了原来数组所在的内存空间。所以，修改了切片数组的值，也就相应的修改了原数组的值了。
>此外，切片可以用append增加元素。但是，如果此时底层数组容量不够，此时切片将会指向一个重新分配空间后进行拷贝的数组。

**因此可以得出结论：**

* 切片并不存储任何数据，它只是描述了底层数组中的一段。
* 更改切片的元素会修改其底层数组中对应的元素。
* 与它共享底层数组的切片都会观测到这些修改。

### make

切片可以用内建函数 make 来创建，这也是你创建动态数组的方式。

两个定义，len（长度）和cap（容量）：

len是数组的长度，指的是这个数组在定义的时候，所约定的长度。 

cap是数组的容量，指的是底层数组的长度，也可以说是原数组在内存中的长度。 

```go
a := make([]int, 5)  // len(a)=5
b := make([]int, 0, 5) // len(b)=0, cap(b)=5
b = b[:cap(b)] // len(b)=5, cap(b)=5
b = b[1:]      // len(b)=4, cap(b)=4
```


# 进阶语法

## 结构体

>在结构体中也遵循用大小写来设置公有或私有的规则。如果这个结构体名字的第一个字母是大写，则可以被其他包访问，否则，只能在包内进行访问。而结构体内的字段也一样，也是遵循一样的大小写确定可用性的规则。

### 定义

```go
type 结构体名 struct {
    字段1 类型
    字段2 类型
}
```
### 声明

#### 使用var关键字

```go
var s T
s.a = 1
s.b = 2
```
>注意，在使用了var关键字之后不需要初始化，这和其他的语言有些不同。Golang会自动分配内存空间，并将该内存空间设置为默认的值，我们只需要按需进行赋值即可。

#### 使用new函数

```go
type people struct {
  name string age int 
} 
func main() { 
  ming := new(people) 
  ming.name = "xiao ming" 
  ming.age = 18 
}
```
#### 使用字面量

```go
type people struct {
    name string
    age int
}
func main() {
    ming := &people{"xiao ming", 18}
}
```
#### 区别

第一种使用`var`声明的方式，返回的是该实例的结构类型，而第二第三种，返回的是一个指向这个结构类型的一个**指针**，是地址。 

所以，对于第二第三种返回指针的声明形式，在我们需要修改他的值的时候，其实应该使用的方式是:

```plain
(*ming).name = "xiao wang"
```
 但是，在Golang中，可以省略这一步骤，直接使用`ming.name = "xiao wang"`。尽管如此，我们应该知道这一行为的原因，分清楚自己所操作的对象究竟是什么类型，掌握这点对下面**方法**这一章节至关重要。 
## 方法

## label

### break label

break的跳转标签(label)必须放在循环语句**for循环前面**，并且在break label跳出循环**不再执行for循环里的代码。**


### goto label

goto label的label(标签)既可以定义在**for循环前面**,也可以定义在**for循环后面**，当跳转到标签地方时，**继续执行标签下面的代码**。

# 并发

## 线程与协程

进程和线程是由操作系统进行调度的，协程是对内核透明，由程序自己调度的。协程的切换一般由程序员在代码中**显式控制**，而不是交给操作系统去**调度**。它避免了上下文切换时的额外耗费，兼顾了多线程的优点，简化了高并发程序的复杂。

## goroutine

## channel

```go
var pipline chan int
// 无缓冲信道
pipline = make(chan int)
// pipline := make(chan int, 0)
// 缓冲信道
// pipline := make(chan int, 10)

// 往信道中发送数据
pipline<- 200
// 从信道中取出数据，并赋值给mydata
mydata := <-pipline
// 关闭
close(pipline)

// 当从信道中读取数据时，可以有多个返回值，其中第二个可以表示 信道是否被关闭，如果已经被关闭，ok 为 false，若还没被关闭，ok 为true。
x, ok := <-pipline
```
### 单向信道

默认情况下都是双向信道

可细分为只读信道和只写信道

#### 只读信道

```go
var pipline = make(chan int)
type Receiver = <-chan int // 关键代码：定义别名类型
var receiver Receiver = pipline
```
#### 只写信道

```go
var pipline = make(chan int)
type Sender = chan<- int  // 关键代码：定义别名类型
var sender Sender = pipline
```
仔细观察，区别在于 <- 符号在关键字 chan 的左边还是右边。
* <-chan 表示这个信道，只能从里发出数据，对于程序来说就是只读
* chan<- 表示这个信道，只能从外面接收数据，对于程序来说就是只写

有同学可能会问：为什么还要先声明一个双向信道，再定义单向通道呢？比如这样写

```plain
type Sender = chan<- int 
sender := make(Sender)
```
 
因为信道肯定读和写都要有

## range

```go
import "fmt"
func fibonacci(mychan chan int) {
    n := cap(mychan)
    x, y := 1, 1
    for i := 0; i < n; i++ {
        mychan <- x
        x, y = y, x+y
    }
    // 记得 close 信道
    // 不然主函数中遍历完并不会结束，而是会阻塞。
    close(mychan)
}
func main() {
    pipline := make(chan int, 10)
    go fibonacci(pipline)
    for k := range pipline {
        fmt.Println(k)
    }
}
```
## select

## WaitGroup


# Reference

[Golang入门：一天学完GO的进阶语法](https://juejin.cn/post/6844904119774216206)

[W3Cschool Go错误处理](https://www.w3cschool.cn/go/go-error-handling.html)

[Golang入门：一天学完GO的基本语法](https://juejin.cn/post/6844904117450571790)

[Go中文文档](http://shouce.jb51.net/golang-doc/41.html)

[Go Modules的使用方法](https://studygolang.com/articles/19334)

[学习 Go 协程：WaitGroup](https://mp.weixin.qq.com/s?__biz=MzU1NzU1MTM2NA==&mid=2247483746&idx=1&sn=5fb55f41cd5b11d7e13959dd94b454d3&chksm=fc355b09cb42d21f2efdf871dbe611db62bcd9cbfd10d0bb27fa657246dfcb561aa228a61007&scene=21#wechat_redirect)

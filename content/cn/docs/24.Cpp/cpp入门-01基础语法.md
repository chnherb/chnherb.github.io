---
categories: ["cpp"]
tags: [""]
title: "cpp入门-01基础语法"
# linkTitle: ""
weight: 10
description: >

---

# 前言

为什么要学 cpp 这门语言？

自从大一学了 c 和 cpp 这两门语言后，除了后来学习数据结构、操作系统、Linux 用QT做了个课程设计，后来再也没怎么用过这两门语言了。后来研究生毕业找工作选择了 Java，这几年都是在看 Java 各种中间件源码，可以说 Java 水平应该还是可以的，只要稍花时间能够解决各类问题。

在基本学完 RPC/MQ/ES 等中间件的入门知识后，延着分布式的路径逐步去学习存储时，基本上都是基于 cpp 来实现的，比如 kv、newsql、文档数据库等等。底层的高性能组件基本都是 cpp 实现的，因此，捡起来原来丢的知识是值当的。其实是因为我想去看下像 leveldb/rocksdb 这种经典的源码。

# 基础语法

## 头文件-命名空间

1、C++头文件不必是 .h 结尾，C语言中的标准库头文件如 math.h、stdio.h 在 C++ 被命名为 cmath、cstdio（去掉 .h 增加了 c 头）。

比如：cstring是c语言的，string是c++的。

2、除了 C 的多行注释，C++ 可以使用单行注释

```c++
/*
注释
*/
// 注释
```

3、命名空间namespace

为了防止名字冲突，C++引入了命名空间（namespace，也称名字空间）。

通过 :: 运算符限定某个名字属于哪个命名空间。

通常有3种方法使用名字空间X的名字name：

```c++
using namespace X; // 引入整个命名空间，如 using namespace std;
using X::name;  // 使用单个名字，如 using std::cout; using std::cin; using std::endl;
X::name;   // 程序中加上命名空间前缀
```

## 标准输入输出流

C++ 新的输入输出流库（头文件iostream）将输入输出看成一个流，并用输出运算符 << 和输入运算符 >> 对数据（变量和常量进行输入输出）。其中有 cout 和 cin 分别代表标准输出流对象（屏幕窗口）和标准输入流对象（键盘），标准库中的名字都属于标准命名空间 std。

```c++
#include <iostream>
// #include <cmath>
using std::cout;
// using namespace std;
int main()
{
  double a;
  cout << "从键盘输入一个数" << std::endl;
  std::cin >> a;
  a = sin(a);
  cout << a;
  return 0;
}
```

## 变量

### 变量定义

变量“即用即定义”，且可用表达式初始化

```c++
#include <iostream>
using namespace std;
int main()
{
  double a = 13 * 3.15;
  double b = a + 1.23;
  cout << "a: " << a << endl;
  cout << "b: " << b << endl;
  return 0;
}
```

### 变量作用域

程序块 {} 内部作用域可定义域外部作用域同名的变量，在该块里隐藏了外部变量。

```c++
#include <iostream>
using namespace std;
int main()
{
  double a;
  cout << "Type a number: ";
  cin >> a;
  {
    int a = 1; // 隐藏了外部作用域的 double a
    a = a *10 + 5;
    cout << "Local a: " << a << endl;
  }
  cout << "Type a: " << a << endl;
  return 0;
}
```

### 局部变量

for 循环语句可以定义局部变量。

```c++
#include <iostream>
using namespace std;
int main()
{
  int i = 0;
  for (int i = 0; i < 4; i++) 
  {
    cout << i << endl;
  }
  cout << "i: " << i << endl;
  for (i = 0; i < 4; i++) 
  {
    for (int i = 0; i < 4; i++) 
    {
      cout << i << " ";
    }
    cout << endl;
  }
  return 0;
}
```

### 全局变量

访问和内部作用域变量同名的全局变量，要用全局作用域限定 :: 

```c++
#include <iostream>
using namespace std;
double a = 128;
int main()
{
  double a = 256;
  cout << "Local a: " << a << endl;
  cout << "Global a: " << ::a << endl;
  return 0;
}
```

## 引用

C++引入了“引用类型”，即一个变量是另一个变量的别名。

```c++
#include <iostream>
using namespace std;
int main()
{
  double a = 3.1415926;
  double &b = a;  // b 是 a 的别名，b 就是 a
  b = 67; // a 的内存块值赋值为 67
  cout << "a: " << a << endl; // 67
  return 0;
}
```
swap
```c++
#include <iostream>
using namespace std;
void swap(int x, int y) {
    cout << "swap before: " << x << " " << y << endl;
    int t = x;
    x = y;
    y = t;
    cout << "swap after: " << x << " " << y << endl << endl;
}
// 修改的是 x,y 指向的那 2 个 int 型变量的内容
void swap2(int *x, int *y) {
    cout << "swap before: " << *x << " " << *y << endl;
    int t = *x;
    *x = *y;
    *y = t;
    cout << "swap after: " << *x << " " << *y << endl << endl;
}
// x,y 是实参的引用
void swap3(int &x, int &y) {
    cout << "swap before: " << x << " " << y << endl;
    int t = x;
    x = y;
    y = t;
    cout << "swap after: " << x << " " << y << endl << endl;
}
int main()
{
    int a = 2, b = 3;
    swap(a, b);
    cout << "main : " << a << " " << b << endl << endl; // 2 3
    a = 2, b = 3;
    swap2(&a, &b);
    cout << "main : " << a << " " << b << endl << endl; // 3 2
    a = 2, b = 3;
    swap3(a, b);
    cout << "main : " << a << " " << b << endl << endl; // 3 2
    return 0;
}
```
当实参栈内存大时，用引用代替传值（需要复制）可提高效率。
如果不希望因此无意中改变实参，可以用 const 修饰符，如：

```c++
void change(double &x, const double &y, double z) {
  x = 100;
  y = 200; // error，不可修改
  z = 300;
}
```

# 函数

## 内联函数

对于不包含循环的简单函数，建议用inline关键字声明为“inline内联函数”，编译器将内联函数调用其代码展开，称为“内联展开”，避免函数调用开销，提高程序执行效率。

```c++
#include <iostream>
#include <cmath>
using namespace std;
inline double distance(double a, double b) {
    return sqrt(a * a + b * b);
}
int main() {
    double a = 3, b = 9;
    cout << distance(a, b) << endl;
    return 0;
}
```

## 默认形参

默认形参：函数的形参可带有默认值。必须一律在最右边

```c++
double func(double a, double b = 6)
{
}
```

## 函数重载

C++ 允许函数同名，只要它们的形参不一样（个数或对应参数类型），调用函数时将根据实参和形参的匹配选择最佳函数，如果有多个难以区分的最佳函数，则变化一起报错！

注意：不能根据返回类型区分同名函数。

```c++
int add(int a, int b)
{
}
double add(double a, double b)
{
}
```

## 运算符重载

```c++
#include <iostream>
using namespace std;
struct Vector2 {
    double x;
    double y;
};
Vector2 operator*(double a, Vector2 b) {
    Vector2 r;
    r.x = a * b.x;
    r.y = a * b.y;
    return r;
}
Vector2 operator+(Vector2 a, Vector2 b) {
    Vector2 r;
    r.x = a.x + b.x;
    r.y = a.y + b.y;
    return r;
}
ostream &operator<<(ostream &o, Vector2 a) {
    o << "(" << a.x << ", " << a.y << ")";
    return o;
}
int main() {
    Vector2 k, m;
    k.x = 2;
    k.y = -1;
    m = 3 * k;
    cout << "m: (" << m.x << " " << m.y << ")" << endl;
    Vector2 s = m + k;
    cout << "s: (" << s.x << " " << s.y << ")" << endl;
    cout << s << endl;
}
```

## 模板函数

厌倦了重复功能的实现。

```c++
#include <iostream>
using namespace std;
template<class T>
T minValue(T a, T b) {
    if (a < b)
        return a;
    else return b;
}
int main() {
    int i = 3, j = 4;
    cout << "min of " << i << " and " << j << " is " << minValue(i, j) << endl;
    double x = 3.1, y = 5.6;
    cout << "min of " << x << " and " << y << " is " << minValue(x, y) << endl;
    // 不同类型会报错
    // cout << "min of " << x << " and " << j << " is " << minValue(x, j) << endl;
}
```
不同类型比较
```c++
#include <iostream>
using namespace std;
template<class T1, class T2>
T1 minValue(T1 a, T2 b) {
    if (a < b)
        return a;
    else return (T1) b;
}
int main() {
    int j = 4;
    double x = 3.1;
    // 不同类型会报错
    cout << "min of " << x << " and " << j << " is " << minValue(x, j) << endl;
}
```

# 异常

## try-catch

通过 try-catch 处理异常情况。正常代码放在 try 块，catch 中捕获 try 块抛出的异常。

```c++
#include <iostream>
#include <string>
using namespace std;
int main() {
    int a = 10;
    try {
        if (a > 100) throw 100;
        if (a < 10) throw 10;
        throw "error";
    } catch (int result) {
        cout << "catch: " << result << endl;
    } catch (char *c) {
        cout << "catch: " << string(c) << endl;
    }
}
```

# 动态内存分配

关键字 new 和 delete 比C语言的 malloc/alloc/realloc 和 free 更好，可以对类对象调用初始化构造函数或销毁析构函数。

```c++
#include <iostream>
using namespace std;
int main() {
    // 变量d是一块存放double值的内存块
    double d = 3.14;
    // 指针变量dp：保存double类型的地址的变量，
    // dp的值类型是 double * ，dp存放的是 double * 类型值的内存块
    double *dp;
    // 取地址运算符 & 用于获得一个变量的地址
    // 将double变量d的地址（指针）保存到 double* 指针变量 dp 中
    dp = &d;
    // 解引用运算符 * 用于获取指针变量指向的那个变量（C++中也成为对象
    // *dp 就是 dp 指向的那个 d
    *dp = 4.15;
    cout << "*dp=" << *dp << ", d=" << d << endl; // *dp=4.15, d=4.15
    cout << "Type a number:";
    cin >> *dp; // 5.16
    // 输出 dp 指向的 double 内存块的值
    cout << "*dp=" << *dp << ", d=" << d << endl; // *dp=5.16, d=5.16
    // new 分配正好容纳double值的内存块（如4或8个字节）
    // 并返回这个内存块的地址，而且地址的类型是 double *
    // 这个地址呗保存在 dp 中，dp 指向这个新内存块，不再是原来的
    // 注意：new 分配的是堆存储空间，即所有程序共同拥有的自由内存
    // 而 d,dp 等局部变量是这个程序自身的静态存储空间
    // new 会对这个double元素调用double类型的构造函数做初始化
    dp = new double;
    cout << "*dp=" << *dp << ", d=" << d << endl; // *dp=0, d=5.16
    *dp = 6.17;
    cout << "*dp=" << *dp << ", d=" << d << endl; // *dp=6.17, d=5.16
    *dp = *dp + 1;
    cout << "*dp=" << *dp << ", d=" << d << endl; // *dp=7.17, d=5.16
    // 释放 dp 指向的动态分配的 double 内存块
    delete dp;
    // new 分配了可以存放5个double值的内存块，返回这块连续内存的起始地址。
    // 且指针类型是 double * ，实际上是第一个 double 元素的地址
    // new 会对每个 double 元素调用 double 类型的构造函数
    dp = new double[5];
    dp[0] = 10.01;          // dp[0] 等价于 *(dp+0) 即*dp，也就是第一个double元素
    dp[1] = dp[0] + 1.01;   // dp[1] 等价于 *(dp+1) ，也就是第一个double元素
    cout << "dp[0]=" << dp[0] << ", dp[1]=" << dp[1] << endl; // dp[0]=10.01, dp[1]=11.02
    delete[] dp; // 注意：如果是 delete dp，那么只能释放第一个 double 元素空间
    int n = 3;
    dp = new double[n];
    for (int i = 0; i < n; i++) {
        dp[i] = i;
    }
    double *p = dp;
    for (int i = 0; i < n; i++) {
        cout << *(p + i) << endl;
    }
    cout << endl;
    for (double *p = dp, *q = dp + n; p < q; p++) {
        cout << *p << endl;
    }
    delete[] dp;
    char *s;
    s = new char[10];
    strcpy(s, "hello!");
    cout << s << endl;
    delete[] s;
    return 0;
}
```


# 类

## 类的定义

类：是在 C 的 struct 类型上，增加了“成员函数”。C 的 struct 可将一个概念或实体的所有属性组合在一起，描述同一类对象的共同属性。

C++ 使得 struct 不但包含数据，还包含函数（方法）用于访问或修改类变量（对象）的属性。

```c++
#include <iostream>
using namespace std;
struct Date {
    int d, m, y;
    void init(int dd, int mm, int yy) {
        d = dd;
        m = mm;
        y = yy;
    }
    void print() {
        cout << y << "-" << m << "-" << d << endl;
    }
};
int main() {
    Date day;
    day.print();
    day.init(5, 1, 2023);
    day.d = 6;
    day.print();
    return 0;
}
```

## 自引用

```c++
#include <iostream>
using namespace std;
struct Date {
    int d, m, y;
    void init(int dd, int mm, int yy) {
        d = dd;
        m = mm;
        y = yy;
    }
    void print() {
        cout << y << "-" << m << "-" << d << endl;
    }
    Date& add(int dd) {
        d = d + dd;
        return *this; // this指向调用函数的类型对象指针，*this就是调用这个函数的那个对象。
                        // 这个成员函数返回的是 "自引用"，即调用这个函数本身
                        // 通过返回自引用，可以连续调用这个函数。day.add(3).add(7);
    }
};
int main() {
    Date day;
    day.print();
    day.init(5, 1, 2023);
    day.d = 6;
    day.add(3);
    day.add(5).add(7);
    day.print();
    return 0;
}
```

## 成员函数重载运算符

```c++
#include <iostream>
using namespace std;
struct Date {
    int d, m, y;
    void init(int dd, int mm, int yy) {
        d = dd;
        m = mm;
        y = yy;
    }
    void print() {
        cout << y << "-" << m << "-" << d << endl;
    }
    Date &operator+=(int dd) {
        d = d + dd;
        return *this;
    }
};
int main() {
    Date day;
    day.print();
    day.init(5, 1, 2023);
    day.d = 6;
    day.operator+=(2);
    day += 5;
    (day += 3) += 7;
    day.print();
    return 0;
}
```

## 构造函数

```c++
#include <iostream>
using namespace std;
struct Date {
    int d, m, y;
    Date() {
    }
    // 这里可以定义默认值，参数后面直接加=xx
    Date(int dd, int mm, int yy) {
        cout << "constructor!" << endl;
        d = dd;
        m = mm;
        y = yy;
    }
    void print() {
        cout << y << "-" << m << "-" << d << endl;
    }
};
int main() {
    Date day1; // 如果没有找到默认无参构造函数会报错！定义有参但都有默认值同默认无参构造函数
    Date day(5, 1, 2023);
    day.print();
    return 0;
}
```

## 析构函数

```c++
#define _CRT_SECURE_NO_WARNINGS # windows
#include <iostream>
#include <cstring>
using namespace std;
struct student {
    char *name;
    int age;
    student(char *n = "no_name", int a = 20) {
        int len = strlen(n);
        name = new char[len + 1];
        strcpy(name, n);
        age = a;
    }
    virtual ~student() {
        cout << "destructor!" << name << endl;
        delete[] name; // 防止内存泄漏
    }
};
int main() {
    student stu1;
    student stu2("wang");
    student stu3("zhang", 22);
    cout << stu1.name << "\t" << stu1.age << endl;
    cout << stu2.name << "\t" << stu2.age << endl;
    cout << stu3.name << "\t" << stu3.age << endl;
    return 0;
}
```

## 访问控制与接口

class 定义的类成员默认是 private 的， struct 定义的类成员默认是 public 的。

接口：public的公开成员（一般是成员函数）称为这个类的对外接口，外部函数只能通过这些接口访问类对象。private等非public的包含内部细节，不对外公开，从而可以封装保护类对象！

```c++
#define _CRT_SECURE_NO_WARNINGS # windows
#include <iostream>
#include <cstring>
using namespace std;
class student {
private:
    char *name;
    int age;
public:
    student(char *n = "no_name", int a = 20) {
        int len = strlen(n);
        name = new char[len + 1];
        strcpy(name, n);
        age = a;
    }
    char *get_name() {
        return name;
    }
    int get_age() {
        return age;
    }
    void set_name(char *n="new_name") {
        delete[] name;
        int len = strlen(n);
        name = new char[len+1];
        strcpy(name, n);
    }
    void set_age(int a) {
        age = a;
    }
    virtual ~student() {
        cout << "destructor!" << name << endl;
        delete[] name; // 防止内存泄漏
    }
};
int main() {
    student stu1;
    student stu2("wang");
    student stu3("zhang", 22);
    stu2.set_name("wang123");
    stu2.set_age(25);
    cout << stu1.get_name() << "\t" << stu1.get_age() << endl;
    cout << stu2.get_name() << "\t" << stu2.get_age() << endl;
    cout << stu3.get_name()<< "\t" << stu3.get_age() << endl;
    return 0;
}
```

## 拷贝构造函数

拷贝构造函数：定义一个类对象时用同类型的另外对象初始化。

赋值运算符：一个对象赋值给另外一个对象。

默认的拷贝函数析构函数可能会有问题，如硬拷贝，举例如下。

### 硬拷贝1

```c++
#define _CRT_SECURE_NO_WARNINGS
#include <iostream>
#include <cstring>
using namespace std;
struct student {
private:
    char *name;
    int age;
public:
    student(char *n = "no_name", int a = 20) {
        cout<< "构造函数" << endl;
        int len = strlen(n);
        name = new char[len + 1];
        strcpy(name, n);
        age = a;
    }
    char *get_name() {
        return name;
    }
    int get_age() {
        return age;
    }
    void set_name(char *n="new_name") {
        delete[] name;
        int len = strlen(n);
        name = new char[len+1];
        strcpy(name, n);
    }
    void set_age(int a) {
        age = a;
    }
    virtual ~student() {
        cout << "destructor!" << name << endl;
        delete[] name; // 防止内存泄漏
    }
};
int main() {
    student stu1;
    student stu2(stu1); // 拷贝构造函数，硬拷贝
    cout << stu1.get_name() << "\t" << stu1.get_age() << endl;
    cout << stu2.get_name() << "\t" << stu2.get_age() << endl;
    // error 重复销毁 delete[] stu1.name  delete[] stu2.name 
    return 0;
}
```
### 硬拷贝2

```c++
int main() {
    student stu1;
    student stu2("lisi", 25); // stu2.name
    stu1 = stu2; // stu1.name=stu2.name
    cout << stu1.get_name() << "\t" << stu1.get_age() << endl;
    cout << stu2.get_name() << "\t" << stu2.get_age() << endl;
    // error 重复销毁 delete[] stu1.name  delete[] stu2.name
    return 0;
}
```

### 拷贝构造函数示例

```c++
#define _CRT_SECURE_NO_WARNINGS
#include <iostream>
#include <cstring>
using namespace std;
class student {
private:
    char *name;
    int age;
public:
    student(char *n = "no_name", int a = 20) {
        cout<< "构造函数" << endl;
        int len = strlen(n);
        name = new char[len + 1];
        strcpy(name, n);
        age = a;
    }
    student(const student &s) {
        cout<< "拷贝构造函数" << endl;
        // name = s.name; // 硬拷贝
        int len = strlen(s.name);
        name = new char[len + 1]; // name = new char[100];
        strcpy(name, s.name);
        age = s.age;
    }
    student& operator=(const student &s) {
        cout<< "赋值运算符" << endl;
        // name = s.name; // 硬拷贝
        int len = strlen(s.name);
        name = new char[len + 1]; // name = new char[100];
        strcpy(name, s.name);
        age = s.age;
        return *this;
    }
    char *get_name() {
        return name;
    }
    int get_age() {
        return age;
    }
    void set_name(char *n="new_name") {
        delete[] name;
        int len = strlen(n);
        name = new char[len+1];
        strcpy(name, n);
    }
    void set_age(int a) {
        age = a;
    }
    virtual ~student() {
        cout << "destructor!" << name << endl;
        delete[] name; // 防止内存泄漏
    }
};
int main() {
    student stu1;
    student stu2("lisi", 25); // stu2.name
    student stu3(stu2); // 拷贝构造函数 student(const student &s)
    stu1 = stu2; // stu1.operator=(stu2);
    cout << stu1.get_name() << "\t" << stu1.get_age() << endl;
    cout << stu2.get_name() << "\t" << stu2.get_age() << endl;
    // error 重复销毁 delete[] stu1.name  delete[] stu2.name
    return 0;
}
```

### 类体外定义成员函数

```c++
#include <iostream>
#include <cstring>
using namespace std;
class Date {
    // 默认private
    int d, m, y;
public:
    void print();
    Date(int dd = 1, int mm = 1, int yy = 2023) {
        cout << "构造函数" << endl;
        d = dd;
        m = mm;
        y = yy;
    }
    ~Date() {
        cout << "析构函数" << endl;
    }
};
void Date::print() {
    cout << y << "-" << m << "-" << d << endl;
}
int main() {
    Date d;
    d.print();
    return 0;
}
```

## 类模板

```c++
#define _CRT_SECURE_NO_WARNINGS
#include <iostream>
#include <string>
// cstring是c语言的，string是c++的，注意区别
using namespace std;
template<class T>
class Array {
    // 默认private
    int size;
    T *data;
public:
    Array(int s) {
        size = s;
        data = new T[s];
    }
    ~Array() {
        delete[] data;
    }
    T &operator[](int i) {
        if (i < 0 || i >= size) {
            cout << endl << "Out of bounds" << endl;
            throw "超出范围";
        } else
            return data[i];
    }
};
int main() {
    int len = 3;
    Array<string> d(3);
    d[0] = "hello";
    d[1] = "world";
    for (int i = 0; i < len; i++) {
        cout << d[i] << endl;
    }
    int n;
    cin >> n; // 5
//    Array t(n);
    Array<double> t(n);
    t[0] = 5;
    t[1] = t[0] + 1;
    cout << t[1] << endl;
    t[10] = 1;
    return 0;
}
```

## 类别名typedef

```c++
#include <iostream>
using namespace std;
typedef int INT;
int main() {
    INT i = 3;
    cout << i << endl;
    return 0;
}
```

# string

## string赋值

```c++
#include <iostream>
#include <string>
using namespace std;
typedef string String;
int main() {
    string s1; // 默认构造函数，没有参数或参数有默认值
    String s2("hello"); // 普通构造函数， String 就是 string
    s1 = "haha"; // 赋值运算符
    String s3(s1); // 拷贝构造函数
    cout << "s1:" << s1 << endl;
    cout << "s2:" << s2 << endl;
    cout << "s3:" << s3 << endl;
    string s4("123456789", 8);
    cout << "s4:" << s4 << endl; // 12345
    // string, start position, number of characters
    string s5(s4, 2, 4);
    cout << "s5:" << s5 << endl; // 3456
    // number characters, character itself
    string s6(3, '*');
    cout << "s6:" << s6 << endl; // ***
    // start iterator, end iterator
    string s7(s4.begin(), s4.end() - 3);
    cout << "s7:" << s7 << endl; // 12345
    string s8 = "abcdefghijk";
    cout << "s8:" << s8 << endl; // abcdefghijk
    string s9 = s1 + " and " + s2;
    cout << "s9:" << s9 << endl; // haha and hello
    return 0;
}
```

## string遍历

```c++
#include <iostream>
#include <string>
using namespace std;
typedef string String;
int main() {
    string s = "hello";
    string w = "world";
    s = s + w;
    for (int i = 0; i != s.size(); i++) {
        cout << i << " " << s[i] << endl;
    }
    cout << endl;
    string::const_iterator ci;
    int i = 0;
    for (ci = s.begin(); ci != s.end(); ci++) {
        cout << i++ << " " << *ci << endl;
    }
    string::iterator cii;
    int ii = 0;
    for (cii = s.begin(); cii != s.end(); cii++) {
        *cii = 'A';
        cout << ii++ << " " << *cii << endl;
    }
    return 0;
}
```

## vector

```c++
#include <iostream>
#include <vector>
using std::cout;
using std::cin;
using std::endl;
using std::vector;
int main() {
    vector<double> ss;
    int num;
    cout << "Type a numbers:" << endl;
    cin >> num;
    ss.resize(num);
    for (vector<double>::size_type i = 0; i < num; i++) {
        ss[i] = i;
    }
    for (vector<double>::iterator it = ss.begin(); it != ss.end(); it++) {
        cout << *it << endl;
    }
    return 0;
}
```

# 继承与多态

## 派生类

Inheritance 继承（Derivation派生）：一个派生类（derived class）从1个或多个父类（parent class）/基类（base class）继承，即继承父类的属性和行为。

```c++
#include <iostream>
#include <string>
using namespace std;
class Employee {
    string name;
public:
    Employee(string n);
    void print();
};
class Manager : public Employee {
    int level;
public:
    Manager(string n, int l = 1);
    void print();
};
Employee::Employee(string n) : name(n) { // 初始化成员列表
}
void Employee::print() {
    cout << name << endl;
}
Manager::Manager(string n, int l) : Employee(n), level(l) {
}
void Manager::print() {
    // 不能访问基类的name
    cout << level << "\t";
    Employee::print();
}
// error: 派生类的构造函数只能描述它自己的成员和其直接基类的初始值，不能去初始化基类的成员。
//Manager::Manager(string n, int l) : name(n), level(l) {
//
//}
int main() {
    Employee e("eee");
    Manager m("mmm");
    m.print();  // 1  mmm
    e.print();  // eee
    Employee *p = &m;
    p->print(); // mmm，注意：调用的是 Employee:print()
    p = &e;
    p->print(); // eee
    // Employee employees[10]; // error，没有默认的构造函数
    Employee *employees[10];
    int num = 0;
    employees[num] = &e;
    num++;
    employees[num] = &m; // 派生类的指针可以自动转化为基类指针，用一个指向基类的指针分别指向基类对象和派生类对象。
    num++;
    for (int i = 0; i < num; i++) {
        employees[i]->print(); // 基本同上，调用的都是Employee:print()
    }
    Employee *p1;
    Employee *ems[5];
    num = 0;
    p1 = new Manager("m2", 3);
    employees[num] = p1;
    num++;
    p1 = new Employee("e2");
    employees[num] = p1;
    num++;
    for (int i = 0; i < num; i++) {
        employees[i]->print(); // 基本同上，调用的都是Employee:print()
    }
    return 0;
}
```

## 虚函数与多态

将上面派生类的示例，基类的函数修改为虚函数，就能实现多态。

```c++
class Employee {
    string name;
public:
    Employee(string n);
    virtual void print();
};
```

## 多重继承

多重派生（Multiple inheritance）：从多个不同的类派生出一个类来。

```c++
#include <iostream>
using namespace std;
class One {
};
class Two {
};
class MultipleInheritance : public One, public Two {
    
};
int main() {
    return 0;
}
```

## 纯虚函数和抽象类

函数体=0的虚函数称为“纯虚函数”。包含纯虚函数的类称为“抽象类”。抽象类不能被实例化。抽象类通常用来定义接口。

```c++
#include <iostream>
using namespace std;
class Animal {
protected:
    string name;
public:
    Animal(string n) : name(n) {
    }
    string getName() {
        return name;
    }
    virtual const char *speak() = 0;
};
class Cow : public Animal {
public:
    Cow(string n) : Animal(n) {
    }
};
int main() {
//    Animal a; // 抽象类不能被实例化
    Cow cow("cow1"); // error，Cow仍然是抽象类
    return 0;
}
```

实现纯虚函数：

```c++
#include <iostream>
using namespace std;
class Animal {
protected:
    string name;
public:
    Animal(string n) : name(n) {
    }
    string getName() {
        return name;
    }
    virtual const char *speak() = 0;
};
class Cow : public Animal {
public:
    Cow(string n) : Animal(n) {
    }
    virtual const char *speak() {
        return "Moo";
    }
};
int main() {
//    Animal a; // 抽象类不能被实例化
    Cow cow("cow1"); // error，Cow仍然是抽象类
    cout << cow.speak() << endl;
    return 0;
}
```

# Reference


---
categories: [""] 
tags: [""] 
title: "pydemo"
# linkTitle: ""
weight: 5
description: >
  
---

# 语法

## 路径

```python
print(os.getcwd())
print(os.path.abspath(os.path.dirname(__file__))) 
# 版本判断
import sys
if ((3, 0) <= sys.version_info <= (3, 9)):
    from urllib.parse import urlparse
elif ((2, 0) <= sys.version_info <= (2, 9)):
    from urlparse import urlparse



# 去除空邮箱
mail_box_list = [_ for _ in mail_box_list if _]



from datetime import date
today = date.today()
# 判断是否为周二或周五
today.weekday() in [1, 4]



invoice_process_dict = {process.id: process for process in process_list}
result = [invoice for invoice in invoice_list if is_switch_open(inv)]



for index, item in enumerate(l):



def list_partition(ls, size):
    """
    列表等分
    :param ls:
    :param size:
    :return:
    """
    return [ls[i:i + size] for i in range(0, len(ls), size)]
```



  

## format

```python
table_template = 
"""<td>{invoice_serial}</td><td>{should_pay_date}</td><td>{over_due_day}</td></tr>"""
table_content = table_template.format(invoice_serial=invoice_serial,
                            should_pay_date = should_pay_date,
                          over_due_day = should_pay_date)
                          

# 打印{}
operate_detail_info = "account催款联系人邮箱:{{{}}} > {{{}}}".format(old_value, new_value)
```
 
## 去除英式符号

```python
import string
def remove_punctuation(self, stri): 
  punctuation_string = string.punctuation 
  for s in punctuation_string: 
    stri = stri.replace(s, '') 
  return stri
```

## groupby

```python
from itertools import groupby
def group_by(item_list, key_func):
    return {key: list(val) for key, val in groupby(item_list, key=key_func)}
    
item_list2 = None
    item_dict2 = group_by(item_list2, key_func=lambda key: key.id) if item_list2 else {} # item_dict2={}
    print(item_dict2)
```

## split_list

```python
recon_id_list = [1, 2, 3, 4, 5, 6]
loop_num = 3
split_list = [recon_id_list[i:i + loop_num] for i in range(0, len(recon_id_list), loop_num)]
```
## date日期

```python
from datetime import date
import datetime
# date日期，2020-12-08
today = date.today()
print(today.year)
print(today.month)
print(today.day)
tomorrow = today + datetime.timedelta(days=1)

# 自定义日期
mydate=date(2020,12,15)
# 计算相隔天数
diff = str((date.today() - mydate).days) if mydate else None

# date转datetime
today_time = datetime.datetime.combine(today, datetime.datetime.min.time())

utc_now_date = datetime.utcnow().date()
```

## datetime时间

```python
# datetime时间
now_time = datetime.datetime.now()
# 自定义时间格式化字符串
time_format_str = now_time.strftime("%Y-%m-%d %H:%M:%S")

#自定义制定时间
now_time = datetime.datetime(2020, 10, 15, 12, 32, 40)

#字符串转日期
s = "2020-08-05 2:30:20"
t = datetime.datetime.strptime(s, "%Y-%m-%d %H:%M:%S")
print(t.year)
print(t.month)
print(t.day)
datetime.combine(should_pay_date + timedelta(days=1), time.min)

# 前一天时间
yesterday_time = now_time + timedelta(days=-1)

# datetime转date
t_date = t.date()

# utc时间转当前时区
def datetime_from_utc_to_local(utc_datetime):
    now_timestamp = time.time()
    offset = datetime.fromtimestamp(now_timestamp) - datetime.utcfromtimestamp(now_timestamp)
    # print(offset)
    return utc_datetime + offset

# time_zone = 8
local_date = time_start + timedelta(hours=float(time_zone)) 

# python2 datetime转时间戳
now_time = datetime.datetime.utcnow()
# print(time.time())  当前时区的时间，差8小时
time_stramp = long(time.mktime(now_time.timetuple()))
```


## 去除全角半角

```python
def full2half(s):
    n = []
    for char in s:
        num = ord(char)
        if num == 0x3000:
            num = 32
        elif 0xFF01 <= num <= 0xFF5E:
            num -= 0xfee0
        num = unichr(num)
        n.append(num)
    return ''.join(n)

def clear_format(input_str):
    return full2half(str(input_str)).replace(u' ', u'').lower()
```

## populate_obj

```plain
# o1-old  o2-new
def populate_obj(o1, o2, ignore_attr_names=None):
    attr_list = vars(o1).keys()
    for attr in attr_list:
        if attr.startswith('_'):
            continue
        if ignore_attr_names and attr in ignore_attr_names:
            continue
        if hasattr(o2, attr):
            setattr(o2, attr, getattr(o1, attr))
```

# 使用excel

```python
python xlrd读取excel，ctype=sheet1.cell(i,j).ctype，有以下几种类型：
0 – empty：空
1 – string：字符串
2 – number：数字
3 – date：日期
4 – boolean：布尔
5 – error 
```

# 打包

```python
pyinstaller -F -w roster.py

sudo chmod 777 roster 
```

# 装饰器

参考：[https://zhuanlan.zhihu.com/p/45458873](https://zhuanlan.zhihu.com/p/45458873)

高阶函数：接受函数为入参，或者把函数作为结果返回的函数。后者称之为嵌套函数。

闭包：指延伸了作用域的函数，其中包含函数定义体中引用、但是不在定义体中定义的非全局变量。概念比较晦涩，简单来说就是嵌套函数引用了外层函数的变量。

## 高阶函数

```python
def add(a, b):
    print(a + b)

# 高阶函数
def timer(func,*args):
    start = time.time()
    func(*args)
    time.sleep(2) # 模拟耗时操作
    long = time.time() - start
    print(long)
timer(add, 1, 2)   
```
## 装饰器

```python

def timer(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        func(*args, **kwargs) # 此处拿到了被装饰的函数func
        time.sleep(2) # 模拟耗时操作
        long = time.time() - start
        print(long)
    return wrapper #返回内层函数的引用

@timer # @为语法糖，相当于timer(add)，如果time有多个，顺序靠前的在里面
def add(a, b):
    print(a + b)

add(1, 2) #正常调用add
```
装饰器的加载到执行的流程：
模块加载 ->> 遇到@，执行timer函数，传入add函数 ->> 生成timer.<locals>.wrapper函数并命名为add，其实是覆盖了原同名函数 ->> 调用add(1, 2) ->> 去执行timer.<locals>.wrapper(1, 2) ->> wrapper内部持有原add函数引用(func)，调用func(1, 2) ->>继续执行完wrapper函数

## 带参数的装饰器

```python
def auth(permission):
    def _auth(func):
        # 注意这个functools.wraps的作用
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            print("auth = " + permission)
            func(*args, **kwargs)
            print("DONE...")
        return wrapper
    return _auth

@auth("ADD")
def add(a, b):
    """
    SUM
    """
    print(a + b)

add(1, 2)
print(add)
print(add.__name__)
print(add.__doc__)
```
functools.wraps对我们的装饰器函数进行了装饰之后，add表面上看起来还是add。
functools.wraps内部通过partial和update_wrapper对函数进行再加工，将原始被装饰函数(add)的属性拷贝给装饰器函数(wrapper)。

# functools

参考：[https://zhuanlan.zhihu.com/p/45535784](https://zhuanlan.zhihu.com/p/45535784)

## wraps

同带参修饰器

## partial

```python
import functools

def add(a, b):
    print(a + b)

add = functools.partial(add, 1)
add(2)
```
add函数原本接收两个参数a和b，经过partial包装之后，a参数的值被固定为了1，新的add对象（注意此处add已经是一个可调用对象，而非函数，下文分析源码会看到）只需要接收一个参数即可。
通俗点说：**就是把原函数的部分参数固定了初始值，新的调用只需要传递其它参数。**

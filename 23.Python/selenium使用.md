>使用selenium操作已经打开的浏览器页面，避免输入密码等繁杂操作 

# 背景

在使用selenium进行自动化测试会遇到，手工打开浏览器，做了一部分操作后，并打开相关页面后再执行相关的自动化脚本。如何使用selenium来接管先前已打开的浏览器呢？醍提出一个Google Chrome浏览器的解决方案。

# 实战

我们可以利用Chrome DevTools协议。它允许客户检查和调试Chrome浏览器。

将执行文件加入path：

```shell
# mac中
cd ~
vi .bash_profile 
```
输入以下内容
```java
PATH=$PATH:/Applications/Google\ Chrome.app/Contents/MacOS/ 
```
保存并退出 
```shell
source .bash_profile 
```

打开cmd，在命令行中输入命令： 

```shell
chrome.exe --remote-debugging-port=9222 --user-data-dir="d:\temp\selenum\AutomationProfile” 
```

mac中：

```shell
Google\ Chrome --remote-debugging-port=9222 --user-data-dir="/Users/bo/Library/Application Support/Googlehrome/Default"
# /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
# 注意命令行中需要加入\，代码中则不需要 
```


对于-remote-debugging-port值，可以指定任何打开的端口。 

对于-user-data-dir标记，指定创建新Chrome配置文件的目录。它是为了确保在单独的配置文件中启动chrome，不会污染你的默认配置文件。 

此时会打开一个浏览器页面，我们输入百度网址，我们把它当成一个已存在的浏览器： 

现在，我们需要接管上面的浏览器。新建一个python文件，运行以下代码：

```python
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
 
chrome_options = Options()
chrome_options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
chrome_driver = "d:\python_tool\chromedriver.exe” # 注意这是driver
# driver = webdriver.Chrome(chrome_driver, chrome_options=chrome_options)
driver = webdriver.Chrome(chrome_options=chrome_options) # driver配置在$PATH中则不需要指定driver

print(driver.title) 
```

最后打印出了 “百度一下，你就知道” 的网页标题。确认我们实现了对一个已打开的浏览器的控制。

注意：调试完之后要结束Google Chrome


# Reference

[用selenium控制已打开的浏览器](https://www.cnblogs.com/programer-xinmu78/p/10890343.html) 


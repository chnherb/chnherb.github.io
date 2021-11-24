
# gitbook

## 安装

```shell
npm install gitbook-cli -g
```

## 创建

```shell
mkdir hb_blog
cd hb_blog
gitbook init 
```
此时出现问题，按照如下解决
### 问题

* [gitbook出现TypeError: cb.apply is not a function解决办法](https://www.cnblogs.com/cyxroot/p/13754475.html)

[https://www.cnblogs.com/cyxroot/p/13754475.html](https://www.cnblogs.com/cyxroot/p/13754475.html)

* TypeError  [ERR_INVALID_ARG_TYPE]: The "data" argument must be of type string

[https://xiaosongshine.blog.csdn.net/article/details/116235787](https://xiaosongshine.blog.csdn.net/article/details/116235787)

mac node版本降级

```shell
# 安装node版本管理模块n
sudo npm install n -g
# 安装稳定版
sudo n stable
# 安装最新版
sudo n latest
# 版本降级/升级
sudo n 版本号  # 如：sudo n 12.22.1
```

## 运行

```shell
# 运行
gitbook serve  
# 或 ，要求根目录有 package.json 文件
# 没有package.json文件则运行 npm init
npm run serve

# 编译
gitbook build
```
## 安装插件

### 插件官网

[https://www.npmjs.com/](https://www.npmjs.com/)

通用安装方法：

```shell
# 在book.js文件中配置好之后，直接运行
gitbook install
```
### 提前准备

book.js文件准备，在gitbook项目根目录下

```javascript
module.exports = {
    title: "chnherb's blog",
    description: "chnherb's blog about computer technology",
    author: "chnherb",
    lang: "zh-cn",
    plugins: [],
    pluginsConfig: {},
    variables: {
    },
};
```
### 搜索加强

```shell
// 项目目录下执行
npm install gitbook-plugin-search-pro
```
在book.js中添加
```javascript
plugins: ["search-pro"],
```
### 代码框插件

```shell
npm install gitbook-plugin-code
```
在book.js中添加
```javascript
plugins: ["code"],
```
### 自定义主题插件

```shell
npm install gitbook-plugin-theme-主题名
```
在book.js中添加
```javascript
plugins: ["theme-主题名"],
```
### 菜单折叠插件

```shell
npm install gitbook-plugin-expandable-chapters
```
在book.js中添加
```javascript
plugins: ["expandable-chapters"],
```
### 返回顶部插件

```shell
npm install gitbook-plugin-back-to-top-button
```
在book.js中添加
```javascript
plugins: ["back-to-top-button"],
```
### 页内目录插件

```dockerfile
gitbook-plugin-intopic-toc
```
## 按照文件自动生成SUMMARY

```shell
npm install -g gitbook-summary
# 使用
boom sm # 注意md文件名不要有空格，否则目录链接失效
```

## github配置pages

1、创建chnherb.github.io仓库

2、提交代码到 gh-pages 分支

3、在 settings->pages 中设置 Source 为 gh-pages


## Reference

Gitbook+Github Pages+Github Actions：

[https://www.cnblogs.com/phyger/p/14035937.html#_29](https://www.cnblogs.com/phyger/p/14035937.html#_29)

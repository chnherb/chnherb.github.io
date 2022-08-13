---
categories: [""] 
tags: [""] 
title: "vue结合后台接口配置调试环境"
# linkTitle: ""
weight: 5
description: >
  
---

## **1、配置webpack.config.js文件中output和devServer**

```javascript
var path = require("path")
var webpack = require("webpack")
​
module.exports = {
  entry : {
    index : "./src/main.js"
  },
  output : {
    filename : "index.js",
    path : path.resolve(__dirname, "../../springbootdemo/src/main/resources/static")
  },
  devServer: {
    contentBase: path.join(__dirname, "../../springbootdemo/src/main/resources/static"),
    compress: true,
    port: 9000,
  },
  module : {
    loaders : [
    //
    ]
  },
  //
}
```
devServer中contentBase为调试时（npm run dev）访问的index.html的文件路径，port为端口。output中path为index.html引用的js文件路径，index.html代码如下：
```javascript
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Title</title>
</head>
<body>
  <div id="app"></div>
  <script src="./index.js"></script>
  </body>
</html>
```
两者路径需要同步。
## **2、调试时前端指定后端访问ip/域名和端口，**

在main.js中添加如下代码：

```javascript
JavaScript
// const base_url = ""; //发布环境
const base_url="http://localhost:8080"; //开发环境，前后端分离调试
​
//设置全局拦截器
Vue.http.interceptors.push(function(request, next) {
request.credentials = true;
​
// Re-build url
request.url=base_url+request.getUrl();
console.log("Request URl:"+request.getUrl());
​
// continue to next interceptorg
next((response) => {
if(response.status == 401) {
window.location = "/";
}
else if(!response.ok){
this.$notify.error({
title: "错误",
message: "后台打了个盹儿，请稍后再试！",
duration: 2000,
offset: 0
});
}
else if(response.body.type=='ERROR'){
this.$notify.error({
title: "错误",
message: response.body.message,
duration: 2000,
offset: 0
});
}
return response;
});
});
```
## 3、配置后端程序允许跨域请求

不同版本spring/springboot的默认配置可能支持跨域，能正常请求，则跳过此步骤。如果不能正常请求且Console中报错：

```java
Access to XMLHttpRequest at 'http://localhost:8080/userInfo' 
from origin 'http://localhost:9000' has been blocked by CORS policy: 
The value of the 'Access-Control-Allow-Origin' header in the response 
must not be the wildcard '*' when the request's credentials mode is 
'include'. The credentials mode of requests initiated by the 
XMLHttpRequest is controlled by the withCredentials attribute.
```
此时Network的Response Headers中Access-Control-xxx只有 Access-Control-Allow-Origin: * ，则需要后端配置。参考链接为：SpringBoot 1.X、2.X 解决跨域问题 和 Spring boot 和Vue开发中CORS跨域问题。
```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
​
@Configuration
public class CustomCORSConfiguration {
  private CorsConfiguration buildConfig() {
    CorsConfiguration corsConfiguration = new CorsConfiguration();
    // corsConfiguration.addAllowedOrigin("http://localhost:9000");
    corsConfiguration.addAllowedOrigin("*");
    corsConfiguration.addAllowedHeader("*");
    corsConfiguration.addAllowedMethod("*");
    corsConfiguration.setAllowCredentials(true);
    return corsConfiguration;
  }
  @Bean
  public CorsFilter corsFilter() {
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", buildConfig());
    return new CorsFilter(source);
  }
}
```
此时，Console不会报错，并且Network的Response Headers中Access-Control-xxx有**Access-Control-Allow-Credentials:**true和**Access-Control-Allow-Origin:**[http://localhost:9000](http://localhost:9000)。
## **4、调试**

首先启动后端程序，然后运行npm run dev。前端页面的修改会自动热更新。

## **5、部署前端代码**

运行npm run build，会在webpack.config.js文件中output指定的路径生成js文件，最终的程序运行也只是依赖这个js文件，与之前的vue等资源文件没有关联。

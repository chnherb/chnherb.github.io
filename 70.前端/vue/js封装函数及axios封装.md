# **一、js封装**

## **方法一**

1、被封装方法，文件httputil.js

```javascript
exports.getHttpPOSTRes = function(ob, url, params = null) {
    console.log("httppst");
    ob.$http.post(url, {}, {emulateJSON: true}).then(response => {
            console.log(response);
            console.log(response.body);
            console.log(response.body.code);
            return response.body;
        }, (response) => {
            return response.body;
        }
    );
}
​
exports.add = function(a, b) {
    console.log("addd");
   return a+b;
}
```
2、引用
```javascript
var httputil = require('../util/httputil.js');
​
function xxx(){
// let res = await httputil.getHttpPOSTRes(ob, url); //由于vue http的问题这里返回空
    let res = await httputil.add(1,2);
    console.log("get---------")
    console.log(res);
}
```

## 方法二

1、被封装方法，文件httputil.js

```javascript
export function getHttpPOSTRes(ob, url, params = null) {
    console.log("httppst");
    ob.$http.post(url, {}, {emulateJSON: true}).then(response => {
            console.log(response);
            console.log(response.body);
            console.log(response.body.code);
            return response.body;
        }, (response) => {
            return response.body;
        }
    );
}
```
2、引用
```javascript
import getHttpPOSTRes from '../util/httputil.js';
function xxx(){
// let res = await httputil.getHttpPOSTRes(ob, url); //由于vue http的问题这里返回空
    let res = await httputil.add(1,2);
    console.log("get---------")
    console.log(res);
}
```

# 二、axios封装

1、axiosutil.js

```javascript
import axios from 'axios'
// import qs from 'qs'
​
const bearboard_url = "http://ife.test.sankuai.com"
​
// 创建axios实例
const service = axios.create({
    baseURL: process.env.BASE_API, // node环境的不同，对应不同的baseURL
    timeout: 5000, // 请求的超时时间
    //设置默认请求头，使post请求发送的是formdata格式数据// axios的header默认的Content-Type好像是'application/json;charset=UTF-8',我的项目都是用json格式传输，如果需要更改的话，可以用这种方式修改
    // headers: {
    // "Content-Type": "application/x-www-form-urlencoded"
    // },
    withCredentials: true // 允许携带cookie
})
​
// service.defaults.headers.post['Content-Type'] = 'application/json';
​
// 发送请求前处理request的数据
axios.defaults.transformRequest = [function (data) {
    let newData = ''
    for (let k in data) {
        newData += encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) + '&'
    }
    return newData
}]
​
// request拦截器
service.interceptors.request.use(
    config => {
        // 发送请求之前，要做的业务
        config.url = bearboard_url + config.url;
        console.log(config.url);
        return config
    },
    error => {
        // 错误处理代码
        return Promise.reject(error)
    }
)
​
// response拦截器
service.interceptors.response.use(
    response => {
        // 数据响应之后，要做的业务
        return response
    },
    error => {
        return Promise.reject(error)
    }
)
​
​
// export default service
​
export default function(obj) {
    // var state = obj.state;
    var url = obj.url;
    var method = obj.method || 'post';
    if(method == 'post'){
        var data = obj.params;
    }else{
        var params = obj.params;
    }
    return new Promise((resolve, reject) => {
        service({
            method,
            url,
            // data: qs.stringify(data),
            data,
            params,
        }).then(res => {
            resolve(res.data);
        }).catch(res => {
            reject(res);
        })
    })
}
```
2、引用
```javascript
import fetch from '../util/axiosutil.js'
​
function xxx(){
    fetch({
        method: 'get',
        url: url,
        params:{
          id: "123",
          name: "zhangsan"
        }
    })
      .then(res => {
          console.log(res)
    })
}
​
​
import {Notification as notify} from 'element-ui';
function xxx(){
    fetch({
        url: url,
    }).then(response => {
        let res = response.data;
        console.log(res);
        if (res.code == 200)
          commit('setHeadPicData', res.data);
    }).catch(e => {
        notify.error({
          title: '头图审核提交失败',
          message: '原因：服务器连接失败',
      })
   });
}
```

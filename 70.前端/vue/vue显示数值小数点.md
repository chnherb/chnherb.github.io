# **一、html中使用**

```javascript
<span class="money">￥{{money | priceFilter}}</span>
```
# **二、过滤器**

## **1、局部过滤器**

在当前vue页面的script的export default中定义：

```javascript
<script>
export default{
  filters: {
    priceFilter (value) {
      // 截取当前数据到小数点后两位
      let realVal = parseFloat(value).toFixed(2)
      return realVal
    }
  }
}
</script>
```
## **2、全局过滤器**

在全局的index.js中定义：

```javascript
Vue.filter("priceFilter", function (value) {
  // 截取当前数据到小数点后几位
  let realVal = parseFloat(value).toFixed(1);
  return realVal;
});
```




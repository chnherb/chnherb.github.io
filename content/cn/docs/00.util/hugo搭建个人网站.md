---
categories: ["util"]
tags: ["hugo"]
title: "hugo搭建个人网站"
# linkTitle: ""
weight: 10
description: >

---

## hugo下载&安装

hugo：[https://github.com/gohugoio/hugo/releases](https://github.com/gohugoio/hugo/releases)

下载对应版本，然后解压并配置全局可用，如：

```shell
tar -zxvf hugoxxxx.tar.gz -C /Users/Bo/hugo-blog
cd /Users/Bo/hugo-blog && sudo cp hugo /usr/local/bin/
```

## docsy

### 搭建步骤

```shell
git submodule update --init --recursive --depth 1

hugo server # 生成文件以内存方式启动
hugo server -dpublic  # 把网站临时发布到其指定的目录

HUGO_ENV=production hugo --minify --verbose
# 以当前目录启动静态服务器
cd public
python3 -m http.server 4005
python -m SimpleHTTPServer 4005
```

### gitbook文件转换

```shell
for file in `find . -name "README.md"`
do
  newfile=`echo $file | sed 's/README.md/_index.md/g'`
  mv $file $newfile
  echo $newfile
done
```

### 增加文件头

```shell
for file in `find . -name "*.md"`
do
  if test -f $file
  then
    filename=${file##*/}
    filename=${filename%.*}
    echo -e """---
categories: [\"\"] 
tags: [\"\"] 
title: \"$filename\"
# linkTitle: \"\"
weight: 10
description: >
  
---\n\n$(cat $file)""" > $file
  fi
done
```

### 适配图片相对路径

```shell
for file in `find . -name "*.md"`
do
  sed -i 's#./imgs/#../imgs/#g' $file
done
```

### 适配文件路径大小写

```yaml
disablePathToLower = true
```
 
### node版本升级

```shell
npm -v 
npm install npm@latest -g
node -v
sudo npm cache clean -f
sudo npm install -g n
sudo n stable
sudo n 8.1.2
node -v
```

## hugo-shortcode

### 折叠代码

在 ./layouts/shortcodes/ 目录下新建 code.html 文件，内容如下：

```xml
{{ $_hugo_config := `{ "version": 1}` }}
{{- $codeTitle := .Get 0 -}}
<details>
    <summary>{{ $codeTitle }}</summary>
    {{.Inner}}
</details>
```
markdown 文件中使用代码折叠功能：
>这里为了防止转义，使用了“*﹛﹜*” 来代替 “{}”，注意替换不要直接复制

```markdown
﹛﹛% code 代码 %﹜﹜
  your code 
﹛﹛% /code %﹜﹜
```
>参考博客：[使用 Hugo 的 Shortcode 功能](https://blog.csdn.net/weixin_42465278/article/details/117368730)

### 代码滚动

```xml
<style>
pre {
  overflow-y: auto;
  max-height: 300px;
}
</style>
```
>参考博客：
>[https://its201.com/article/weixin_41929524/124956480](https://its201.com/article/weixin_41929524/124956480)
>[https://orianna-zzo.github.io/sci-tech/2018-08/blog%E5%85%BB%E6%88%90%E8%AE%B016-%E8%87%AA%E5%BB%BAhugo%E7%9A%84toc%E6%A8%A1%E6%9D%BF/](https://orianna-zzo.github.io/sci-tech/2018-08/blog%E5%85%BB%E6%88%90%E8%AE%B016-%E8%87%AA%E5%BB%BAhugo%E7%9A%84toc%E6%A8%A1%E6%9D%BF/)

## hugo-notice

notice 库：[https://github.com/martignoni/hugo-notice](https://github.com/martignoni/hugo-notice)

使用方法：

将 notice.html 复制到 ./layouts/shortcodes/ 目录下即可

>更多详情参考：[在 Hugo 博客上实践 Shortcodes 短代码](https://matnoble.me/tech/hugo/shortcodes-practice-tutorial-for-hugo/#hugo-notice)

## 常见问题

### fatal error: pipe failed

临时解决办法：

```shell
hugo server --watch=false
```
永久解决办法：
```shell
cd /Users/USER_NAME_HERE/Documents/Github/cht-docs
sudo launchctl limit maxfiles 65535 200000
ulimit -n 65535
sudo sysctl -w kern.maxfiles=100000
sudo sysctl -w kern.maxfilesperproc=65535
hugo server
```
>更多参考：[https://github.com/medic/cht-docs/issues/411](https://github.com/medic/cht-docs/issues/411)

## Reference

[https://www.gohugo.org/](https://www.gohugo.org/)

[https://www.docsy.dev/docs/get-started/docsy-as-module/installation-prerequisites/](https://www.docsy.dev/docs/get-started/docsy-as-module/installation-prerequisites/)

[https://skyao.io/learning-hugo/docs/theme/docsy/setup.html](https://skyao.io/learning-hugo/docs/theme/docsy/setup.html)

[https://gohugo.io/content-management/syntax-highlighting/](https://gohugo.io/content-management/syntax-highlighting/)

[https://zhuanlan.zhihu.com/p/98680055](https://zhuanlan.zhihu.com/p/98680055)

[https://www.gohugo.org/post/coderzh-a-hugo-pull-request/](https://www.gohugo.org/post/coderzh-a-hugo-pull-request/)

[hugo配置文件详解](https://dp2px.com/2019/09/04/hugo-config/)

[Chroma Style Gallery](https://xyproto.github.io/splash/docs/all.html)

[https://themes.gohugo.io/themes/hugo-book/](https://themes.gohugo.io/themes/hugo-book/)


---
categories: [""] 
tags: [""] 
title: "github-actions发布pages"
# linkTitle: ""
weight: 5
description: >
  
---



## 生成 token

参考官方文档 [Creating a personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) 

* Profile -> Settings -> Developer settings
* 选择 Personal access tokens
* 仅选择 repo 权限
* 复制 token，只显示一次

## 配置 token

* 在仓库的 settings -> Secrets 新建
* token名称任意，这里为 ACCESS_TOKEN ，后面需要用到


## 准备代码

* 在当前需要部署的仓库根目录下新建文件夹 

```
.github/workflows
```

* 新建文件 gitbook-cli.yml ，文件名任意，后缀固定

```yml 
name: auto-generate-gitbook
on:                                 #在master分支上进行push时触发  
  push:
    branches:
    - master

jobs:
  master-to-gh-pages:
    runs-on: ubuntu-latest
        
    steps:                          
    - name: checkout master
      uses: actions/checkout@v2
      with:
        ref: master
            
    - name: install nodejs
      uses: actions/setup-node@v1
      
    - name: configue gitbook
      run: |
        npm install -g gitbook-cli          
        gitbook install
        npm install -g gitbook-summary
                
    - name: generate _book folder
      run: |
        book sm
        gitbook build
        cp SUMMARY.md _book
                
    - name: push _book to branch gh-pages 
      env:
        TOKEN: ${{ secrets.ACCESS_TOKEN }}
        REF: github.com/${{github.repository}}
        MYEMAIL: chnhuangbo@qq.com                  # ！！记得修改为自己github设置的邮箱
        MYNAME: ${{github.repository_owner}}          
      run: |
        cd _book
        git config --global user.email "${MYEMAIL}"
        git config --global user.name "${MYNAME}"
        git init
        git remote add origin https://${REF}
        git add . 
        git commit -m "Updated By Github Actions With Build ${{github.run_number}} of ${{github.workflow}} For Github Pages"
        git branch -M master
        git push --force --quiet "https://${TOKEN}@${REF}" master:gh-pages
```

## 提交代码

将仓库内代码提交到分支即可，观察仓库Actions

## Reference


[Gitbook+Github Pages+Github Actions](https://www.cnblogs.com/phyger/p/14035937.html#_29)

[GitHub Actions 入门教程 - 阮一峰](https://www.ruanyifeng.com/blog/2019/09/getting-started-with-github-actions.html)

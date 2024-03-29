---
categories: [""]
tags: [""]
title: "HTTPS加密原理"
# linkTitle: ""
weight: 10
description: >

---

# 背景

HTTP的内容是明文传输的，明文数据会经过中间代理服务器、路由器、wifi热点、通信服务运营商等多个物理节点，如果信息在传输过程中被劫持，传输的内容就完全暴露了。劫持者还可以篡改传输的信息且不被双方察觉，这就是中间人攻击。所以需要对信息进行加密。最容易理解的就是对称加密。 

# 对称加密

## 定义

一个密钥可以加密一段信息，也可以对加密后的信息进行解密。

## 可行性

如果通信双方都各自持有同一个密钥，且没有别人知道，这两方的通信安全当然是可以被保证的（除非密钥被破解）。

但是最大的问题就是这个密钥怎么让传输的双方知晓，同时不被别人知道。如果由服务器生成一个密钥并传输给浏览器，那在这个传输过程中密钥被别人劫持到手了怎么办？之后它就能用密钥解开双方传输的任何内容，所以这么做当然不行。

# 非对称加密

简单说就是有两把密钥，通常一把叫做公钥、一把叫私钥，用公钥加密的内容必须用私钥才能解开，同样私钥加密的内容只有公钥能解开。

## 可行性

### 服务端到浏览器链路的安全

鉴于非对称加密的机制，简单的思路：服务器先把公钥以明文方式传输给浏览器，之后浏览器向服务器传数据前都先用这个公钥加密好再传，这条数据的安全似乎可以保障了！因为只有服务器有相应的私钥能解开公钥加密的数据。

然而反过来由服务器到浏览器的这条路怎么保障安全？即服务器怎么将公钥安全地传给浏览器不被劫持。如果服务器用它的私钥加密数据传给浏览器，那么浏览器用公钥可以解密它，而这个公钥是一开始通过明文传输给浏览器的，若这个公钥被中间人劫持到了，那它也能用该公钥解密服务器传来的信息了。所以目前似乎只能保证由浏览器向服务器传输数据的安全性。

### 中间人攻击

* 某网站有用于非对称加密的公钥A、私钥A’。
* 浏览器向网站服务器请求，服务器把公钥A明文给传输浏览器。
* 中间人劫持到公钥A，保存下来，把数据包中的公钥A替换成自己伪造的公钥B（它当然也拥有公钥B对应的私钥B’）。
* 浏览器生成一个用于对称加密的密钥X，用公钥B（浏览器无法得知公钥被替换了）加密后传给服务器。
* 中间人劫持后用私钥B’解密得到密钥X，再用公钥A加密后传给服务器。
* 服务器拿到后用私钥A’解密得到密钥X。
# 数字证书

## 简介

为了解决浏览器收到的公钥一定是该网站的公钥，CA机构给网站颁发的“身份证”即数字证书用来证明网站身份。

网站在使用HTTPS前，需要向CA机构申领一份数字证书，数字证书里含有证书持有者信息、公钥信息等。服务器把证书传输给浏览器，浏览器从证书里获取公钥就行了，证书就如身份证，证明“该公钥对应该网站”。

## 防伪

这里又有一个显而易见的问题，“证书本身的传输过程中，如何防止被篡改”？即如何证明证书本身的真实性？身份证运用了一些防伪技术，而数字证书怎么防伪呢？

把证书原本的内容生成一份“签名”，比对证书内容和签名是否一致就能判别是否被篡改。这就是数字证书的“防伪技术”，这里的“签名”就叫数字签名。

## 数字签名

数字签名的制作过程：

1. CA机构拥有非对称加密的私钥和公钥。
2. CA机构对证书明文数据T进行hash。
3. 对hash后的值用私钥加密，得到数字签名S。
明文和数字签名共同组成了数字证书，这样一份数字证书就可以颁发给网站了。

那浏览器拿到服务器传来的数字证书后，如何验证它是不是真的？（有没有被篡改、掉包）

浏览器验证过程：

1. 拿到证书，得到明文T，签名S。
2. 用CA机构的公钥对S解密（由于是浏览器信任的机构，所以浏览器保有它的公钥。详情见下文），得到S’。
3. 用证书里指明的hash算法对明文T进行hash得到T’。显然通过以上步骤，T’应当等于S‘，除非明文或签名被篡改。所以此时比较S’是否等于T’，等于则表明证书可信。
为什么能保证证书可信？

* 没有私钥无法篡改签名
* 无法掉包证书，因为证书里有域名，不一致则无法掉包
# HTTPS验证流程

1、客户端发起一个http请求，告诉服务器自己支持哪些hash算法。

2、服务端把自己的信息以数字证书的形式返回给客户端（证书内容有密钥公钥，网站地址，证书颁发机构，失效日期等）。证书中有一个公钥来加密信息，私钥由服务器持有。

3、验证证书的合法性

客户端收到服务器的响应后会先验证证书的合法性（证书中包含的地址与正在访问的地址是否一致，证书是否过期）。

4、生成随机密码（RSA签名）

如果验证通过，或用户接受了不受信任的证书，浏览器就会生成一个随机的对称密钥（session key）并用公钥加密，让服务端用私钥解密，解密后就用这个对称密钥进行传输了，并且能够说明服务端确实是私钥的持有者。

5、生成对称加密算法

验证完服务端身份后，客户端生成一个对称加密的算法和对应密钥，以公钥加密之后发送给服务端。此时被黑客截获也没用，因为只有服务端的私钥才可以对其进行解密。之后客户端与服务端可以用这个对称加密算法来加密和解密通信内容了。

# Reference

[彻底搞懂HTTPS的加密原理](https://zhuanlan.zhihu.com/p/43789231)


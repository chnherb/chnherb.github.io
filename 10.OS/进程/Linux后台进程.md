# 背景

使用终端程序启动应用时，一旦退出命令行窗口，应用就会一起退出，无法继续运行。怎么将它变成系统的守护进程（daemon），成为一种服务（serive）？

# 前台/后台任务

变成守护进程的第一步，就是把它改成后台任务。

```shell
xxx xxx &
```
只要在明星的尾部加上“&”，启动的进程就会成为后台任务。**如果要让前台任务变为后台任务，可以先按 ctrl + z，然后执行 bg 命令**（让最近一个暂停的后台任务继续执行）。
后台任务有两个特点：

1、继承当前 session 的标准输出和标准错误，因此后台任务的所有输出依然会同步地在命令行下显示

2、不再继承当前 session 的标注输入，无法向这个任务输入指令。如果它视图读取标注输入，就会暂停执行（halt）

可以看出，前台任务和后台任务的本质区别只要一个：是否继承标准输入。所以，执行后台任务的同时，用户还可以输入其他命令。

**&忽略SIGINT信号**

# SIGHUP信号

Linux系统设计：

1、用户准备退出 session

2、系统向该 session 发出 SIGHUP 信号

3、session 将 SIGHUP 信号发给所有子进程

4、子进程收到 SIGHUP 信号后自动退出

这也解释了为什么前台任务会随着 session 的退出而退出，因为它收到 SIGHUP 信号。

那么，后台任务是否会收到 SIGHUP 信号呢？

这是由 Shell 的 huponexit 参数决定的，执行如下命令可看到该参数的值：

```shell
shopt | grep huponexit
```
大多数Linux系统，这个参数默认关闭（off），因此，session退出的时候，不会把 SIGHUP 信号发给后台任务。所以，一般后台任务不会随着session一起退出。
# disown命令

通过后台任务启动守护进程并不保险，因为有的系统的 huponexit 参数可能是打开的（on）。

更保险的方法是使用 disown 命令，它可以将指定任务从**后台任务列表（jobs 命令返回的结果）**之中移除。一个后台任务只要不在这个列表中，session肯定就不会向它发出 SIGHUP 信号。

```shell
$ xxx xx &
$ disown
```
执行该命令后，正在执行的后台进程就被移出了后台任务列表。可以执行**jobs命令**验证，输出结果里面，不会有这个进程。
## disown 命令使用说明

```shell
# 移出最近一个正在执行的后台任务
$ disown
# 移出所有正在执行的后台任务
$ disown -r
# 移出所有后台任务
$ disown -a
# 不移出后台任务，但是让它们不会收到SIGHUP信号
$ disown -h
# 根据jobId，移出指定的后台任务
$ disown %2
$ disown -h %2
```

# 标准I/O

使用disown命令之后，还有一个问题。那就是，退出 session 以后，如果后台进程与标准I/O有交互，它还是会挂掉。 

举例，后台进程访问后有log输出。按照以下命令运行，退出session，访问进程会发现连接不上

```shell
$ xxx xx &
$ disown
```
这是因为后台任务的标准I/O继承自当前session，disown 命令并没有改变这一点。一旦后台任务读写标准I/O，就会发现它已经不存在，所以会报错终止执行。
为了解决该问题，需要对后台任务的标准I/O进行重定向。

## 重定向

```shell
$ xxx xx > stdout.txt 2> stderr.txt < /dev/null &
$ disown
```

# nohup命令

比 disown 更方便的命令，就是 nohup

```shell
$ nohup xxx xx &
```
nohup 命令对进程做了三件事
1、组织 SIGHUP 信号发到这个进程

2、关闭标准输入。该进程不再能够接收任何输入，即使运行在前台

3、重定向标准输出和标准错误到文件 nohup.out

即，nohup 命令实际上将子进程与它所在的session分离了。

注意：nohup 命令不会自动把任务变为后台任务，所以必须加上 & 符号

## nohup和&比较

no hangup的缩写，意即“不挂断”

```shell
&     # ctrl+c 无影响，但是关闭 shell 程序会终止
nohup # ctrl+c 有影响，忽略SIGHUP信号，关闭 shell 程序不会终止  
nohup command & # 启动一些后台程序
# nohup java -jar xxxx.jar &
```

# Screen/Tmux命令

## Screen

另一种思路是使用 terminal multiplexer （终端复用器：在同一个终端里面，管理多个session），典型的就是 [Screen](https://www.gnu.org/software/screen/) 命令和 [Tmux](https://tmux.github.io/) 命令。

它们可以在当前 session 里面，新建另一个 session。这样的话，当前 session 一旦结束，不影响其他 session。而且，以后重新登录，还可以再连上早先新建的 session。

Screen 的用法如下：

```shell
# 新建一个 session
$ screen
$ xxx xx  # 启动一个任务
```
然后，按下`ctrl + A`和`ctrl + D`，回到原来的 session，从那里退出登录。下次登录时，再切回去。
```plain
$ screen -r
```
如果新建多个后台 session，就需要为它们指定名字。
```plain
$ screen -S name
# 切回指定 session
$ screen -r name
$ screen -r pid_number

# 列出所有 session
$ screen -ls
```
如果要停掉某个 session，可以先切回它，然后按下`ctrl + c`和`ctrl + d`。
## Tmux

Tmux 比 Screen 功能更多、更强大，它的基本用法如下。

```plain
$ tmux
$ node server.js
# 返回原来的session
$ tmux detach
```
除了`tmux detach`，另一种方法是按下`Ctrl + B`和`d` ，也可以回到原来的 session。
```plain
# 下次登录时，返回后台正在运行服务session
$ tmux attach
```
如果新建多个 session，就需要为每个 session 指定名字。
```plain
# 新建 session
$ tmux new -s session_name

# 切换到指定 session
$ tmux attach -t session_name

# 列出所有 session
$ tmux list-sessions

# 退出当前 session，返回前一个 session 
$ tmux detach

# 杀死指定 session
$ tmux kill-session -t session-name
```
 
# Node工具

对于 Node 应用来说，可以不用上面的方法，有一些专门用来启动的工具：[forever](https://github.com/foreverjs/forever)，[nodemon](http://nodemon.io/) 和 [pm2](http://pm2.keymetrics.io/)。

## forever

forever 的功能很简单，就是保证进程退出时，应用会自动重启。

```plain
 # 作为前台任务启动
$ forever server.js

# 作为服务进程启动 
$ forever start app.js

# 停止服务进程
$ forever stop Id

# 重启服务进程
$ forever restart Id

# 监视当前目录的文件变动，一有变动就重启
$ forever -w server.js

# -m 参数指定最多重启次数
$ forever -m 5 server.js 

# 列出所有进程
$ forever list
```
## nodemon

`nodemon`一般只在开发时使用，它最大的长处在于 watch 功能，一旦文件发生变化，就自动重启进程。

```plain
# 默认监视当前目录的文件变化
$ nodemon server.js

＃ 监视指定文件的变化   
$ nodemon --watch app --watch libs server.js  
```
## pm2

pm2 的功能最强大，除了重启进程以外，还能实时收集日志和监控。

```plain
# 启动应用
$ pm2 start app.js

# 指定同时起多少个进程（由CPU核心数决定），组成一个集群
$ pm2 start app.js -i max

# 列出所有任务
$ pm2 list

# 停止指定任务
$ pm2 stop 0

＃ 重启指定任务
$ pm2 restart 0

# 删除指定任务
$ pm2 delete 0

# 保存当前的所有任务，以后可以恢复
$ pm2 save

# 列出每个进程的统计数据
$ pm2 monit

# 查看所有日志
$ pm2 logs

# 导出数据
$ pm2 dump

# 重启所有进程
$ pm2 kill
$ pm2 resurect

# 启动web界面 http://localhost:9615
$ pm2 web
```

# Systemd  

见 Systemd 专栏

# Reference

[Linux守护进程](https://www.ruanyifeng.com/blog/2016/02/linux-daemon.html)


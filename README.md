# BOP2016

2016年5月

编程之美挑战赛

Rank 236

分数低的原因，MAG的API会出现如下错误：
problem with request: connect ETIMEDOUT 23.99.113.160:80

修改：在调用API前添加1ms延时，可以避免该问题再次出现。

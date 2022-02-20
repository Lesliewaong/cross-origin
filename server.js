//1. 引入express
const express = require('express');
const WebSocket = require('ws');//记得安装ws
const cors = require('cors');
//2. 创建应用对象
const app = express();

// 把server.js文件所在的目录设置为静态文件目录
app.use(express.static(__dirname));
//3. 创建路由规则
// request 是对请求报文的封装
// response 是对响应报文的封装

//JSONP
const username = [];
app.all('/jsonp-server', (request, response) => {
    const { name, callback } = request.query;
    const data = { msg: "用户名设置成功" };
    username.includes(name) ? data.msg = "用户名已存在" : username.push(name);
    console.log(username)
    //将JS对象转化为JSON字符串
    let str = JSON.stringify(data);
    //返回结果
    response.end(`${callback}(${str})`);
});
//CORS
app.use(
  cors({
    "origin": "http://127.0.0.1:5500",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "allowedHeaders": "name",
    "exposedHeaders": "name",
    "credentials": true,
    "maxAge": 6,
    // "preflightContinue": true,
  })
);
// let whitList = ['http://127.0.0.1:5500'] //设置白名单
// app.use(function (req, res, next) {
//     let origin = req.headers.origin
//     if (whitList.includes(origin)) {
//         // 设置哪个源可以访问我
//         res.setHeader('Access-Control-Allow-Origin', origin)
//         // 允许携带哪个头访问我
//         res.setHeader('Access-Control-Allow-Headers', 'name')
//         // 允许哪个方法访问我
//         res.setHeader('Access-Control-Allow-Methods', 'PUT')
//         // 允许携带cookie
//         res.setHeader('Access-Control-Allow-Credentials', true)
//         // 预检的存活时间
//         res.setHeader('Access-Control-Max-Age', 6)
//         // 允许返回的头
//         res.setHeader('Access-Control-Expose-Headers', 'name')
//         if (req.method === 'OPTIONS') {
//             res.end() // OPTIONS请求不做任何处理
//         }
//     }
//     next()
// })
app.put('/cors', function (req, res) {
    console.log(req.headers)
    res.setHeader('name', 'lw') //返回一个响应头，后台需设置
    res.end('我不爱你')
})
app.all('/cors-server', (request, response)=>{
    //设置响应头
    // response.setHeader("Access-Control-Allow-Origin", "*");
    // response.setHeader("Access-Control-Allow-Headers", '*');
    // response.setHeader("Access-Control-Allow-Method", '*');
    // response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
    response.send('hello CORS');
});
// Nginx
app.all('/nginx', (request, response)=>{
    response.send('hello CORS');
});

//4. 监听端口启动服务
app.listen(8000, () => {
    console.log("服务已经启动, 8000 端口监听中....");
});

// WebSocket
const wss = new WebSocket.Server({port:4000});
wss.on('connection',function(ws) {
  ws.on('message', function (data) {
    console.log(data);
    ws.send(`${data}我不爱你`)
  });
})
# 跨域通信

## 同源策略和跨域

**同源策略**：限制从一个源加载的文档或脚本如何与来自另一个源的资源进行交互。这是一个用于隔离潜在恶意文件的关键的安全机制。

同源策略是一种约定，它是浏览器最核心也最基本的安全功能，如果缺少了同源策略，浏览器很容易受到`XSS`、`CSRF`等攻击。所谓同源是指"**协议**+**域名**+**端口**"三者相同，**即便两个不同的域名指向同一个ip地址，也非同源**。

**同源策略限制内容有：**

- `Cookie`、`LocalStorage`、`IndexedDB` 等存储性内容
- `DOM` 节点
- `AJAX` 请求

但是有的标签是允许跨域加载资源：

- `<img src=XXX>`
- `<link href=XXX>`
- `<script src=XXX>`

**当协议、子域名、主域名、端口号中任意一个不相同时，都算作不同域**。不同域之间相互请求资源，就算作“跨域”。

特别说明两点：

**第一：如果是协议和端口造成的跨域问题“前台”是无能为力的。**

**第二：在跨域问题上，仅仅是通过“URL的首部”来识别而不会根据域名对应的IP地址是否相同来判断。“URL的首部”可以理解为“协议, 域名和端口必须匹配”**。

这里你或许有个疑问：**请求跨域了，那么请求到底发出去没有？**

**跨域并不是请求发不出去，请求能发出去，服务端能收到请求并正常返回结果，只是结果被浏览器拦截了**。你可能会疑问明明通过表单的方式可以发起跨域请求，为什么 Ajax 就不会?因为归根结底，跨域是为了阻止用户读取到另一个域名下的内容，Ajax 可以获取响应，浏览器认为这不安全，所以拦截了响应。但是表单并不会获取新的内容，所以可以发起跨域请求。**同时也说明了跨域并不能完全阻止 CSRF，因为请求毕竟是发出去了。**

## Ajax

Asynchronous Javascript And XML是一种异步请求数据的web开发技术，对于改善用户的体验和页面性能很有帮助。简单地说，在不需要重新刷新页面的情况下，Ajax 通过异步请求加载后台数据，并在网页上呈现出来。

### 原生Ajax

#### 发送 Ajax 请求的五个步骤

> XMLHttpRequest（XHR）对象用于与服务器交互。通过 XMLHttpRequest 可以在不刷新页面的情况下请求特定 URL，获取数据。这允许网页在不影响用户操作的情况下，更新页面的局部内容。

* 创建`XMLHttpRequest` 对象。`const xhr = new XMLHttpRequest()`

* 使用`open`方法设置请求的参数。`xhr.open(method, url, 是否异步)`。

  * `get`可以把请求参数拼接在`url`

  * 如果想要使用`post`提交数据,必须添加此行。

    `xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");`

* 发送请求。

  * `get`请求：`xhr.send()`
  * ``post`请求：将数据通过`send`方法传递 `xhr.send('name=fox&age=18');`

* 注册事件。 注册`onreadystatechange`事件，状态改变时就会调用。

  * `xhr.readyState===4`
  * `(xhr.status>=200 && xhr.status<300) || xhr.status === 304` 304：服务器端资源未改变，可直接使用客户端未过期的缓存。

* 获取返回的数据，更新UI。

#### onreadystatechange 事件

注册 `onreadystatechange` 事件后，每当 `readyState` 属性改变时，就会调用 `onreadystatechange` 函数。

`readyState`：（存有 `XMLHttpRequest` 的状态。从 0 到 4 发生变化）

- 0: 请求未初始化

- 1: 服务器连接已建立

- 2: 请求已接收

- 3: 请求处理中

- 4: 请求已完成，且响应已就绪

#### 兼容性

IE浏览器通过 `XMLHttpRequest` 或者 `ActiveXObject` （IE6及更低版本浏览器）对象同样实现了ajax的功能。

### Promise封装axios

axios是一个基于`promise`的`HTTP`库，可以用在`浏览器`或者`node.js`中。

axios是通过promise实现对ajax技术的一种封装。

> axios提供两个http请求适配器，XHR和HTTP。XHR的核心是浏览器端的XMLHttpRequest对象；HTTP的核心是node的http.request方法。

**特性**：

- 从浏览器中创建XMLHttpRequests
- 从node.js创建http请求
- 支持promise API
- 拦截请求与响应
- 转换请求数据与响应数据
- 取消请求
- 自动转换JSON数据
- 客户端支持防御XSRF

```jsx
/**
 * 发送异步ajax请求的函数模块
 * 封装axios库
 * 函数返回值promise对象
 * 优化1: 统一处理请求异常?
 * 在外层包一个自己创建的promise对象
 * 在请求出错时, 不reject(error), 而是显示错误提示
 * 优化2: 异步得到不是reponse, 而是response.data
 * 在请求成功resolve时: resolve(response.data)
 */
import axios from 'axios'
import { message } from 'antd'
export default function ajax(url,data={},type='GET') {
    return new Promise((resolve,reject) => {
        let promise;
        // 执行异步ajax请求
        if(type==='GET'){//发GET请求
            promise=axios.get(url,{
                params:data
            })
        }else{//发POST请求
            promise=axios.post(url,data)
        }
        // 如果请求成功了，调用resolve(value)
        // 该方法返回一个以response.data值解析后的Promise对象
        promise.then(response => {
            resolve(response.data)
            // console.log(response.data)
        // 如果请求失败了，不调用reject(reason)，而是提示异常信息   
        }).catch(error => {
            message.error('请求出错了：'+error.message)
        })
    })
 
}
```

## 跨域解决方案

###  JSONP

####  JSONP原理

`JSON with Padding ` JS函数包裹JSON数据。

**利用 `<script>` 标签没有跨域限制的漏洞，网页可以得到从其他来源动态产生的 JSON 数据。JSONP请求一定需要对方的服务器做支持才可以。**

 `<script>` 标签中type的默认属性是`text/javascript`,请求内容就会被浏览器以JS代码进行执行。

`JSONP`和`AJAX`相同，都可以从客户端向服务器端发送请求获取数据。但AJAX属于同源策略，JSONP属于非同源策略（跨域请求）。

#### JSONP优缺点

JSONP优点是简单兼容性好，可用于解决主流浏览器的跨域数据访问的问题。

**缺点是仅支持get方法，具有局限性；不安全，可能会遭受XSS攻击。**

#### JSONP的实现流程

- 声明一个回调函数，其函数名(如`jsonpCallback`)当做参数值，要传递给跨域请求数据的服务器，函数形参为要获取目标数据(服务器返回的data)。
- 创建一个`<script>`标签，把那个跨域的API数据接口地址，赋值给`<script>`的`src`，还要在这个地址中向服务器传递该函数名（可以通过问号传参:`?callback=jsonpCallback`）。
- 服务器接收到请求后，需要进行特殊的处理：把传递进来的函数名和它需要给你的数据拼接成一个字符串。
- 最后服务器把准备的数据通过HTTP协议返回给客户端，客户端再调用执行之前声明的回调函数（`jsonpCallback`），对返回的数据进行操作。

```js
//去创建一个script标签
const script = document.createElement("script");
//script的src属性设置接口地址 并带一个callback回调函数名称
script.src = "http://127.0.0.1:8888/index.php?callback=jsonpCallback";
//插入到页面
document.head.appendChild(script);
//通过定义函数名去接收后台返回数据
function jsonpCallback(data){
    //注意  jsonp返回的数据是json对象可以直接使用
    //ajax  取得数据是json字符串需要转换成json对象才可以使用。
}
```

在开发中可能会遇到多个 JSONP 请求的回调函数名是相同的，这时候就需要一个封装好的JSONP函数。

**React调用jsonp的库**

`yarn add jsonp`

```jsx
import jsonp from 'jsonp'
import {message} from 'antd'
export const reqWeather = (city) => {

  return new Promise((resolve, reject) => {
    const url = `http://api.map.baidu.com/telematics/v3/weather?location=${city}&output=json&ak=3p49MVra6urFRGOT9s8UBWr2`
    // 发送jsonp请求 这里的callback是箭头函数
    jsonp(url, {}, (err, data) => {
      console.log('jsonp()', err, data)
      // 如果成功了
      if (!err && data.status==='success') {
        // 取出需要的数据
        const {dayPictureUrl, weather} = data.results[0].weather_data[0]
        resolve({dayPictureUrl, weather})
      } else {
        // 如果失败了
        message.error('获取天气信息失败!')
      }

    })
  })
}
// reqWeather('北京')
```

#### JSONP请求的简单例子

客户端 `http://127.0.0.1:5500`

```html
<body>
    用户名：<input type="text" id="username">  <button>提交</button>
    <p></p>
    <script>
        //获取 input和p元素
        const input = document.getElementById("username");
        const btn = document.querySelector('button');
        const p = document.querySelector('p');
        //声明回调函数
        function handle(data) {
            //修改 p 标签的提示文本
            p.innerHTML = data.msg;
            console.log(data)
        }
        //绑定事件
        btn.addEventListener('click', function () {
            //获取用户的输入值
            let username = input.value;
            console.log(username)
            //向服务器端发送请求 检测用户名是否存在
            //1. 创建 script 标签
            const script = document.createElement('script');
            //2. 设置标签的 src 属性
            script.src = `http://127.0.0.1:8000/jsonp-server?name=${username}&callback=handle`;
            //3. 将 script 插入到文档中
            document.body.appendChild(script);
        });
    </script>
</body>
```

服务器 `http://127.0.0.1:8000`

```js
//1. 引入express
const express = require('express');

//2. 创建应用对象
const app = express();

//3. 创建路由规则
// request 是对请求报文的封装
// response 是对响应报文的封装

//jsonp服务
const username=[];
app.all('/jsonp-server',(request, response) => {
    const {name,callback} = request.query;
    const data = {msg:"用户名设置成功"};      
    username.includes(name) ? data.msg="用户名已存在" : username.push(name);
    console.log(username)
    //将数据转化为字符串
    let str = JSON.stringify(data);
    //返回结果
    response.end(`${callback}(${str})`);
});

//4. 监听端口启动服务
app.listen(8000, ()=>{
    console.log("服务已经启动, 8000 端口监听中....");
});
```

### CORS

CORS（Cross-Origin Resource Sharing），跨域资源共享。

CORS是官方的跨域解决方案，**需要浏览器和后端同时支持。IE 8 和 9 需要通过 XDomainRequest 来实现**。

通过设置一个**响应头**来告诉浏览器，该请求允许跨域，浏览器收到该响应以后就会对响应放行。

浏览器会自动进行 CORS 通信，实现 CORS 通信的关键是后端。只要后端实现了 CORS，就实现了跨域。

服务端设置 `Access-Control-Allow-Origin` 就可以开启 CORS。 **该属性表示哪些域名可以访问资源，如果设置通配符`*`则表示所有网站都可以访问资源。**

虽然设置 CORS 和前端没什么关系，但是通过这种方式解决跨域问题的话，会在发送请求时出现两种情况，分别为**简单请求**和**复杂请求**。

#### 简单请求

只要同时满足以下两大条件，就属于简单请求

请求方法是 `HEAD`、`GET`、`POST` 三种之一；

HTTP 头信息不超过右边着几个字段：`Accept`、`Accept-Language`、`Content-Language`、`Last-Event-ID` `Content-Type` 只限于三个值 `application/x-www-form-urlencoded`、`multipart/form-data`、`text/plain`；

#### 复杂请求

不符合以上条件的请求，比如请求方法是 `PUT` 或 `DELETE`，或 `Content-Type` 值为 `application/json`。浏览器会在正式通信之前，发送一次 HTTP 预检 `OPTIONS` 请求，先询问服务器，当前网页所在的域名是否在服务器的许可名单之中，以及可以使用哪些 HTTP 请求方法和头信息字段。只有得到肯定答复，浏览器才会发出正式的 `XHR` 请求，否则报错。

#### CORS完整复杂请求的例子

客户端  `http://127.0.0.1:5500`

```html
<body>
    <button>发送请求</button>
    <script>
        const btn = document.querySelector('button');
        btn.addEventListener('click',function (){
            const xhr=new XMLHttpRequest();
            document.cookie="name=leslie";// cookie不能跨域
            xhr.withCredentials=true;// 前端设置是否带cookie
            xhr.open('PUT','http://127.0.0.1:8000/cors', true);
            xhr.setRequestHeader('name','leslie');
            xhr.send();
            xhr.onreadystatechange = function(){
                if(xhr.readyState===4){
                    if((xhr.status>=200 && xhr.status<300) || xhr.status === 304){
                        console.log(xhr.response);
                         //得到响应头，后台需设置Access-Control-Expose-Headers
                        console.log(xhr.getResponseHeader('name'))
                    }
                }
            }
            

        })

    </script>
</body>
```

服务器  `http://127.0.0.1:8000`

```js
//1. 引入express
const express = require('express');
const WebSocket = require('ws');//记得安装ws
//2. 创建应用对象
const app = express();
// 把server.js文件所在的目录设置为静态文件目录
app.use(express.static(__dirname));
//3. 创建路由规则
// request 是对请求报文的封装
// response 是对响应报文的封装
//CORS
let whitList = ['http://127.0.0.1:5500'] //设置白名单
app.use(function (req, res, next) {
    let origin = req.headers.origin
    if (whitList.includes(origin)) {
        // 设置哪个源可以访问我
        res.setHeader('Access-Control-Allow-Origin', origin)
        // 允许携带哪个头访问我
        res.setHeader('Access-Control-Allow-Headers', 'name')
        // 允许哪个方法访问我
        res.setHeader('Access-Control-Allow-Methods', 'PUT')
        // 允许携带cookie
        res.setHeader('Access-Control-Allow-Credentials', true)
        // 预检的存活时间
        res.setHeader('Access-Control-Max-Age', 6)
        // 允许返回的头
        res.setHeader('Access-Control-Expose-Headers', 'name')
        if (req.method === 'OPTIONS') {
            res.end() // OPTIONS请求不做任何处理
        }
    }
    next()
})
app.put('/cors', function (req, res) {
    console.log(req.headers)
    res.setHeader('name', 'lw') //返回一个响应头，后台需设置
    res.end('我不爱你')
})

//4. 监听端口启动服务
app.listen(8000, () => {
    console.log("服务已经启动, 8000 端口监听中....");
});
```

第三方中间件

```js
const express = require('express');
const cors = require('cors');
//2. 创建应用对象
const app = express();
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
```

#### 关于CORS的 cookie 问题

想要传递 `cookie` 需要满足 3 个条件

* web 请求设置`withCredentials`

这里默认情况下在跨域请求，浏览器是不带 cookie 的。但是我们可以通过设置 `withCredentials` 来进行传递 `cookie`.

```js
// 原生 xml 的设置方式
const xhr = new XMLHttpRequest();
xhr.withCredentials = true;
// axios 设置方式
axios.defaults.withCredentials = true;
```

2.`Access-Control-Allow-Credentials` 为 `true`

3.`Access-Control-Allow-Origin`为**非** `*`

### postMessage

`postMessage`是`HTML5 XMLHttpRequest Level 2`中的API，且是为数不多可以跨域操作的window属性之一，它可用于解决以下方面的问题：

- 页面和其打开的新窗口的数据传递
- 多窗口之间消息传递
- 页面与嵌套的iframe消息传递

上面三个场景的跨域数据传递。

**postMessage()方法允许来自不同源的脚本采用异步方式进行有限的通信，可以实现跨文本档、多窗口、跨域消息传递**。

```js
otherWindow.postMessage(message, targetOrigin, [transfer]);
```

- `message`: 将要发送到其他window的数据。
- `targetOrigin`:通过窗口的origin属性来指定哪些窗口能接收到消息事件，其值可以是字符串"`*`"（表示无限制）或者一个URI。在发送消息的时候，如果目标窗口的协议、主机地址或端口这三者的任意一项不匹配`targetOrigin`提供的值，那么消息就不会被发送；只有三者完全匹配，消息才会被发送。
- `transfer`(可选)：是一串和`message` 同时传递的 `Transferable` 对象. 这些对象的所有权将被转移给消息的接收方，而发送一方将不再保有所有权。

#### 简单例子

客户端   `http://127.0.0.1:5500`

```js
<body>
    <!-- 等它加载完触发一个事件 -->
    <!-- 内嵌在http://localhost:5500/index.html -->
    <iframe src="http://localhost:8000" frameborder="0" id="frame" onload="load()"></iframe>
    <p></p>
    <script>
        const p = document.querySelector('p');
        function load() {
            let frame = document.getElementById('frame')
            frame.contentWindow.postMessage('我爱你', 'http://localhost:4000') //发送数据
            window.onmessage = function (e) { //接受返回数据
                console.log(e.data) //我不爱你
                p.innerHTML ='客户端：'+ e.data;
            }
        }
    </script>
</body>
```

服务器  `http://127.0.0.1:8000`

```html
<body>
    <p></p>
    <script>
        const p = document.querySelector('p');
        window.onmessage = function (e) {
            console.log(e.data) //我爱你
            p.innerHTML = '服务器：' + e.data;
            e.source.postMessage('我不爱你', e.origin)
        }
    </script>
</body>
```

### WebSocke

`WebSocket`是`HTML5`的一个持久化的协议，它实现了**浏览器与服务器的全双工通信**，同时也是跨域的一种解决方案。

`WebSocket`和`HTTP`都是**应用层协议**，都基于 `TCP` 协议。

但是 **WebSocket 是一种双向通信协议，在建立连接之后，WebSocket 的 server 与 client 都能主动向对方发送或接收数据**。

同时，`WebSocket` 在建立连接时需要借助 `HTTP` 协议，连接建立好了之后 `client` 与 `server` 之间的双向通信就与 `HTTP` 无关了。

#### 简单例子

客户端   `http://127.0.0.1:5500`

```html
<body>
    <script>
        const socket = new WebSocket('ws://localhost:4000');
        socket.onopen = function () {
          socket.send('我爱你');//向服务器发送数据
        }
        socket.onmessage = function (e) {
          console.log(e.data);//接收服务器返回的数据
        }
    </script>
</body>
```

服务器  `http://localhost:4000`

```js
const WebSocket = require('ws');//记得安装ws
const wss = new WebSocket.Server({port:4000});
wss.on('connection',function(ws) {
  ws.on('message', function (data) {
    console.log(data);
    ws.send(`${data}我不爱你`)
  });
})
```

### 代理

简单的说，一般给客户端做代理的都是正向代理，给服务器做代理的就是反向代理。

[![HLcGKx.jpg](https://s4.ax1x.com/2022/02/20/HLcGKx.jpg)](https://imgtu.com/i/HLcGKx)

#### Node中间件代理

实现原理：**同源策略是浏览器需要遵循的标准，而如果是服务器向服务器请求就无需遵循同源策略。** 

代理的思路为，利用服务端请求不会跨域的特性，让接口和当前站点同域。

代理服务器，需要做以下几个步骤：

- 接收客户端请求 。
- 将请求**转发**给服务器。
- 拿到服务器响应数据。
- 将响应**转发**给客户端。

#### React中配置代理

* 在`package.json`中追加如下配置 :`"proxy":http://localhost:5000`

  * 当你请求`http://localhost:5000`产生跨域(本身在`3000`端口)时,添加此代码, 之后你请求时用`http://localhost:3000`进行请求,当其在`3000`端口中找不到资源时将会自动转发至`5000`端口进行请求,不产生跨域问题。

  * 优点：配置简单，前端请求资源时可以不加任何前缀。

  * 缺点：不能配置多个代理

  * 工作方式：上述方式配置代理，当请求了3000不存在的资源时，那么该请求会转发给5000 （优先匹配前端资源）

* 在`src`下创建配置文件：`src/setupProxy.js`

  * ps:必须是这个文件名,react项目运行的时候会自动查找这个文件,并将其加入webpack的配置中,所以当你修改此文件后,你需要重新启动项目

  * 优点：可以配置多个代理，可以灵活的控制请求是否走代理。

  * 缺点：配置繁琐，前端请求资源时必须加前缀。

```js
//代码示例
const proxy = require('http-proxy-middleware')
module.exports = function(app) {
    app.use(
        proxy('/api1', {  //api1是需要转发的请求(所有带有/api1前缀的请求都会转发给5000)
            target: 'http://localhost:5000', //配置转发目标地址(能返回数据的服务器地址)
            changeOrigin: true, //控制服务器接收到的请求头中host字段的值
            /*
       	changeOrigin设置为true时，服务器收到的请求头中的host为：localhost:5000
       	changeOrigin设置为false时，服务器收到的请求头中的host为：localhost:3000
       	changeOrigin默认值为false，但我们一般将changeOrigin值设为true
       */
            pathRewrite: {'^/api1': ''} //去除请求前缀，保证交给后台服务器的是正常请求地址(必须配置)
        }),
        proxy('/api2', { 
            target: 'http://localhost:5001',
            changeOrigin: true,
            pathRewrite: {'^/api2': ''}
        })
    )
}
//App.jsx
export default class App extends Component {
    getStudentData = ()=>{
		axios.get('http://localhost:3000/api1/students').then(
			response => {console.log('成功了',response.data);},
			error => {console.log('失败了',error);}
		)
	}

	getCarData = ()=>{
		axios.get('http://localhost:3000/api2/cars').then(
			response => {console.log('成功了',response.data);},
			error => {console.log('失败了',error);}
		)
	}
    render() {
        return (
            <div>
                <button onClick= {this.getStudentData}>点我获取学生数据</button>
                <button onClick={this.getCarData}>点我获取汽车数据</button>
            </div>
        )
    }
}
```

#### Nginx反向代理

> 测试时注意，Nginx设置了跨域后，服务器不要再设置CORS。

实现原理类似于Node中间件代理，需要你搭建一个中转nginx服务器，用于转发请求。

使用Nginx反向代理实现跨域，是最简单的跨域方式。只需要修改Nginx的配置即可解决跨域问题，支持所有浏览器，支持session，不需要修改任何代码，并且不会影响服务器性能。

##### 简单例子

先下载[nginx](https://link.juejin.cn?target=http%3A%2F%2Fnginx.org%2Fen%2Fdownload.html)，然后将nginx目录下的`nginx.conf`修改如下:

```nginx
// proxy服务器
server {
        listen       81;
        server_name  127.0.0.1;
        
        #charset koi8-r;

        #access_log  logs/host.access.log  main;

        location /nginx/ {
            proxy_pass http://127.0.0.1:8000;
            add_header Access-Control-Allow-Origin *;
        }
}
```

**Nginx常用命令（win）**

* cmd 进入Nginx解压目录 执行以下命令

* `start nginx` : 启动nginx服务

* 关闭cmd窗口是不能结束nginx进程的
  * 快速停止或关闭Nginx：`nginx -s stop`
  * 正常停止或关闭Nginx：`nginx -s quit`
  * 杀死所有Nginx进程：`killall nginx`

* 配置文件修改重装载命令：`nginx -s reload`

常见问题：端口是否占用、Nginx是否结束

**客户端**  `http://127.0.0.1:5500`

```html
<body>
    <button>发送请求</button>
    <div id="result"></div>
    <script>
        const btn = document.querySelector('button');

        btn.onclick = function(){
            //1. 创建对象
            const x = new XMLHttpRequest();
            //2. 初始化设置
            x.open("GET", "http://127.0.0.1:81/nginx");
            // x.open("GET", "http://127.0.0.1:8000/nginx");
            //3. 发送
            x.send();
            //4. 绑定事件
            x.onreadystatechange = function(){
                if(x.readyState === 4){
                    if(x.status >= 200 && x.status < 300){
                        //输出响应体
                        console.log(x.response);
                        document.getElementById("result").innerHTML=x.response;
                    }
                }
            }
        }
    </script>
</body>
```

**服务器**  `http://127.0.0.1:8000`

```js
//1. 引入express
const express = require('express');
//2. 创建应用对象
const app = express();

//3. 创建路由规则
// request 是对请求报文的封装
// response 是对响应报文的封装

// Nginx
app.all('/nginx', (request, response)=>{
    response.send('hello CORS');
});

//4. 监听端口启动服务
app.listen(8000, () => {
    console.log("服务已经启动, 8000 端口监听中....");
});
```

### window.name + iframe

`window.name`属性的独特之处：`name`值在不同的页面（甚至不同域名）加载后依旧存在，并且可以支持非常长的`name` 值（`2MB`）。

其中`a.html`和`b.html`是同域的，都是`http://127.0.0.1:5500`;而`c.html`是`http://127.0.0.1:8000`

`a.html`

```html
<body>
    <iframe src="http://127.0.0.1:8000" frameborder="0" onload="load()" id="iframe"></iframe>
    <script>
      let first = true
      // onload事件会触发2次，第1次加载跨域页，并留存数据于window.name
      function load() {
        if(first){
        // 第1次onload(跨域页)成功后，切换到同域代理页面
          let iframe = document.getElementById('iframe');
          iframe.src = 'http://127.0.0.1:5500/name/b.html';
          first = false;
        }else{
        // 第2次onload(同域b.html页)成功后，读取同域window.name中数据
          console.log(iframe.contentWindow.name);
        }
      }
    </script>
</body>
```

`b.html`为中间代理页，与`a.html`同域，内容为空。

`c.html`

```html
<script>
    window.name = '我不爱你'  
</script>
```

总结：通过iframe的src属性由外域转向本地域，跨域数据即由iframe的`window.name`从外域传递到本地域。这个就巧妙地绕过了浏览器的跨域访问限制，但同时它又是安全操作。

### location.hash + iframe

实现原理： a.html欲与c.html跨域相互通信，通过中间页b.html来实现。 三个页面，不同域之间利用iframe的`location.hash`传值，相同域之间直接js访问来通信。

### document.domain + iframe

**该方式只能用于二级域名相同的情况下，比如 `a.test.com` 和 `b.test.com` 适用于该方式**。 只需要给页面添加 `document.domain ='test.com'` 表示二级域名都相同就可以实现跨域。

实现原理：两个页面都通过js强制设置`document.domain`为基础主域，就实现了同域。

### 总结

- **CORS**支持所有类型的HTTP请求，是跨域HTTP请求的**根本解决方案**。
- **JSONP**只支持**GET**请求，JSONP的优势**在于支持老式浏览器**，以及可以**向不支持CORS的网站请求数据**。
- 不管是**Node中间件代理**还是**Nginx反向代理**，主要是通过**同源策略对服务器不加限制**。
- 日常工作中，用得比较多的跨域方案是**CORS**和**Nginx反向代理**。

## XSS和CSRF

### XSS攻击

#### 什么是 XSS

`Cross-Site Scripting`（跨站脚本攻击）简称 XSS，是一种**代码注入攻击**。攻击者通过在目标网站上注入恶意脚本，使之在用户的浏览器上运行。利用这些恶意脚本，攻击者可获取用户的敏感信息如`Cookie`、`SessionID` 等，进而危害数据安全。

所以,网页上哪些部分会引起XSS攻击?简单来说,任何可以输入的地方都有可能引起,包括URL!

XSS 常见的注入方法：

- 在 HTML 中内嵌的文本中，恶意内容以 `script` 标签形成注入。
- 在**内联的 JavaScript** 中，拼接的数据突破了原本的限制（字符串，变量，方法名等）。
- 在标签属性中，恶意内容包含引号，从而突破属性值的限制，注入其他属性或者标签。
- 在标签的 href、src 等属性中，包含 `javascript:` (伪协议)等可执行代码。
- 在 onload、onerror、onclick 等事件中，注入不受控制代码。
- 在 style 属性和标签中，包含类似 `background-image:url("javascript:...");` 的代码（新版本浏览器已经可以防范）。
- 在 style 属性和标签中，包含类似 `expression(...)` 的 CSS 表达式代码（新版本浏览器已经可以防范）。

#### XSS 攻击的分类

根据攻击的来源，XSS 攻击可分为存储型、反射型和 DOM 型三种。

##### 存储型 XSS

存储型 XSS 的攻击步骤：

1. 攻击者将恶意代码提交到目标网站的数据库中。
2. 用户打开目标网站时，网站服务端将恶意代码从数据库取出，拼接在 HTML 中返回给浏览器。
3. 用户浏览器接收到响应后解析执行，混在其中的恶意代码也被执行。
4. 恶意代码窃取用户数据并发送到攻击者的网站，或者冒充用户的行为，调用目标网站接口执行攻击者指定的操作。

存储型 XSS(又被称为持久性XSS)攻击常见于带有用户保存数据的网站功能，如论坛发帖、商品评论、用户私信等。

它是最危险的一种跨站脚本，相比反射型XSS和DOM型XSS具有更高的隐蔽性，所以危害更大，因为**它不需要用户手动触发**。**任何允许用户存储数据的web程序都可能存在存储型XSS漏洞**，当攻击者提交一段XSS代码后，被服务器端接收并存储，当**所有浏览者访问某个页面时都会被XSS**。

##### 反射型 XSS

反射型 XSS 的攻击步骤：

1. 攻击者构造出特殊的 URL，其中包含恶意代码。
2. 用户打开带有恶意代码的 URL 时，网站服务端将恶意代码从 URL 中取出，拼接在 HTML 中返回给浏览器。
3. 用户浏览器接收到响应后解析执行，混在其中的恶意代码也被执行。
4. 恶意代码窃取用户数据并发送到攻击者的网站，或者冒充用户的行为，调用目标网站接口执行攻击者指定的操作。

反射型 XSS 跟存储型 XSS 的区别是：存储型 XSS 的恶意代码存在数据库里，反射型 XSS 的恶意代码存在 URL 里。

反射型 XSS (也被称为非持久性XSS)漏洞常见于通过 URL 传递参数的功能，如网站搜索、跳转等。

由于需要用户主动打开恶意的 URL 才能生效，攻击者往往会结合多种手段诱导用户点击。

POST 的内容也可以触发反射型 XSS，只不过其触发条件比较苛刻（需要构造表单提交页面，并引导用户点击），所以非常少见。

##### DOM 型 XSS

DOM 型 XSS 的攻击步骤：

1. 攻击者构造出特殊的 URL，其中包含恶意代码。
2. 用户打开带有恶意代码的 URL。
3. 用户浏览器接收到响应后解析执行，前端 JavaScript 取出 URL 中的恶意代码并执行。
4. 恶意代码窃取用户数据并发送到攻击者的网站，或者冒充用户的行为，调用目标网站接口执行攻击者指定的操作。

DOM 型 XSS 跟前两种 XSS 的区别：DOM 型 XSS 攻击中，取出和执行恶意代码由浏览器端完成，属于前端 JavaScript 自身的安全漏洞，而其他两种 XSS 都属于服务端的安全漏洞。

**注意:**
 DOM通常代表在html、xhtml和xml中的对象，使用DOM可以允许程序和脚本动态的访问和更新文档的内容、结构和样式。它不需要服务器解析响应的直接参与，触发XSS**靠的是浏览器端的DOM解析**，所以防范**DOM型XSS完全就是前端的责任,必须注意!!!**。

**对比:**

| 类型       | 存储区                  | 插入点          |
| ---------- | ----------------------- | --------------- |
| 存储型 XSS | 后端数据库              | HTML            |
| 反射型 XSS | URL                     | HTML            |
| DOM 型 XSS | 后端数据库/前端存储/URL | 前端 JavaScript |

#### 防御XSS

只要有输入数据的地方，就可能存在 XSS 危险。

##### 常用防范方法

- **httpOnly:** 在 cookie 中设置 HttpOnly 属性后，js脚本将无法读取到 cookie 信息。
- **输入过滤:** 一般是用于对于输入格式的检查，例如：邮箱，电话号码，用户名，密码……等，按照规定的格式输入。不仅仅是前端负责，后端也要做相同的过滤检查。因为攻击者完全可以绕过正常的输入流程，直接利用相关接口向服务器发送设置。
- **转义 HTML:** 如果拼接 HTML 是必要的，就需要对于引号，尖括号，斜杠进行转义,但这还不是很完善。想对 HTML 模板各处插入点进行充分的转义,就需要采用合适的转义库。
- **白名单:** 对于显示富文本来说，不能通过上面的办法来转义所有字符，因为这样会把需要的格式也过滤掉。这种情况通常采用白名单过滤的办法，当然也可以通过黑名单过滤，但是考虑到需要过滤的标签和标签属性实在太多，更加推荐使用白名单的方式。

##### 预防存储型和反射型 XSS 攻击

存储型和反射型 XSS 都是在服务端取出恶意代码后，插入到响应 HTML 里的，攻击者刻意编写的“数据”被内嵌到“代码”中，被浏览器所执行。

预防这两种漏洞，有两种常见做法：

- 改成纯前端渲染，把代码和数据分隔开。
- 对 HTML 做充分转义。

HTML转义前面已经说过,这里仅仅谈谈纯前端渲染

**纯前端渲染的过程：**

1. 浏览器先加载一个静态 HTML，此 HTML 中不包含任何跟业务相关的数据。
2. 然后浏览器执行 HTML 中的 JavaScript。
3. JavaScript 通过 Ajax 加载业务数据，调用 DOM API 更新到页面上。

在纯前端渲染中，我们会明确的告诉浏览器：下面要设置的内容是文本（`.innerText`），还是属性（`.setAttribute`），还是样式（`.style`）等等。浏览器不会被轻易的被欺骗，执行预期外的代码了。

但纯前端渲染还需注意避免 DOM 型 XSS 漏洞（例如 `onload` 事件和 `href` 中的 `javascript:xxx` 等，请参考下文”预防 DOM 型 XSS 攻击“部分）。

在很多内部、管理系统中，采用纯前端渲染是非常合适的。但对于性能要求高，或有 SEO 需求的页面，我们仍然要面对拼接 HTML 的问题,这时就需要对HTML进行充分的转义。

##### 预防 DOM 型 XSS 攻击

DOM 型 XSS 攻击，实际上就是网站前端 JavaScript代码本身不够严谨，把不可信的数据当作代码执行了。

在使用 `.innerHTML`、`.outerHTML`、`document.write()` 时要特别小心，不要把不可信的数据作为 HTML 插到页面上，而应尽量使用 `.textContent`、`.setAttribute()` 等。

如果用 Vue/React 技术栈，并且不使用 `v-html`/`dangerouslySetInnerHTML` 功能，就在前端 render 阶段避免 `innerHTML`、`outerHTML` 的 XSS 隐患。

DOM 中的内联事件监听器，如 `location`、`onclick`、`onerror`、`onload`、`onmouseover` 等，`<a>` 标签的 `href` 属性，JavaScript 的 `eval()`、`setTimeout()`、`setInterval()` 等，都能把字符串作为代码运行。如果不可信的数据拼接到字符串中传递给这些 API，很容易产生安全隐患，请务必避免。

### CSRF 跨站点请求伪造

#### 什么是 CSRF

跨站请求伪造（英语：Cross-site request forgery），也被称为 one-click attack 或者 session riding，通常缩写为 CSRF 或者 XSRF， 是一种挟制用户在当前已登录的 Web 应用程序上执行非本意的操作的攻击方法。

如:攻击者诱导受害者进入第三方网站，在第三方网站中，向被攻击网站发送跨站请求。利用受害者在被攻击网站已经获取的注册凭证，绕过后台的用户验证，达到冒充用户对被攻击的网站执行某项操作的目的。

#### CSRF攻击流程

[![HLcNVO.png](https://s4.ax1x.com/2022/02/20/HLcNVO.png)](https://imgtu.com/i/HLcNVO)

从上图可以看出，要完成一次CSRF攻击，受害者必须依次完成两个步骤：

- 1.登录受信任网站A，并在本地生成Cookie。
- 2.在不登出A的情况下，访问危险网站B。

看到这里，你也许会说：“如果我不满足以上两个条件中的一个，我就不会受到CSRF的攻击”。是的，确实如此，但你不能保证以下情况不会发生：

- 你不能保证你登录了一个网站后，不再打开一个tab页面并访问另外的网站。
- **你不能保证你关闭浏览器了后，你本地的Cookie立刻过期**，你上次的会话已经结束。（事实上，关闭浏览器不能结束一个会话，但大多数人都会错误的认为关闭浏览器就等于退出登录/结束会话了......）
- 上图中所谓的攻击网站，可能是一个存在其他漏洞的可信任的经常被人访问的网站。

#### 常见的CSRF攻击类型

- #### GET类型的CSRF

GET类型的CSRF利用非常简单，只需要一个HTTP请求，一般会这样利用：

```html
 <img src="http://bank.example/withdraw?amount=10000&for=hacker" > 
```

在受害者访问含有这个img的页面后，浏览器会自动向`http://bank.example/withdraw?account=xiaoming&amount=10000&for=hacker`发出一次HTTP请求。bank.example就会收到包含受害者登录信息的一次跨域请求。

- #### POST类型的CSRF

这种类型的CSRF利用起来通常使用的是一个自动提交的表单，如：

```html
 <form action="http://bank.example/withdraw" method=POST>
    <input type="hidden" name="account" value="xiaoming" />
    <input type="hidden" name="amount" value="10000" />
    <input type="hidden" name="for" value="hacker" />
</form>
<script> document.forms[0].submit(); </script> 
```

访问该页面后，表单会自动提交，相当于模拟用户完成了一次POST操作。

POST类型的攻击通常比GET要求更加严格一点，但仍并不复杂。任何个人网站、博客，被黑客上传页面的网站都有可能是发起攻击的来源，**后端接口不能将安全寄托在仅允许POST上面**。

- #### 链接类型的CSRF

链接类型的CSRF并不常见，比起其他两种用户打开页面就中招的情况，这种需要用户点击链接才会触发。这种类型通常是在论坛中发布的图片中嵌入恶意链接，或者以广告的形式诱导用户中招，攻击者通常会以比较夸张的词语诱骗用户点击，例如：

```html
  <a href="http://test.com/csrf/withdraw.php?amount=1000&for=hacker" taget="_blank">
  重磅消息！！
  <a/>
```

#### CSRF的特点

- 攻击一般发起在第三方网站，而不是被攻击的网站。被攻击的网站无法防止攻击发生。
- 攻击**利用受害者在被攻击网站的登录凭证，冒充受害者提交操作**；而不是直接窃取数据。
- 整个过程攻击者并不能获取到受害者的登录凭证，仅仅是“冒用”。
- 跨站请求可以用各种方式：图片URL、超链接、CORS、Form提交等等。部分请求方式可以直接嵌入在第三方论坛、文章中，难以进行追踪。

CSRF通常是跨域的，因为外域通常更容易被攻击者掌控。但是如果本域下有容易被利用的功能，比如**可以发图和链接的论坛和评论区，攻击可以直接在本域下进行，而且这种攻击更加危险。**

#### CSRF与 XSS 区别

- **通常来说 CSRF 是由 XSS 实现的，CSRF 时常也被称为 XSRF（CSRF 实现的方式还可以是直接通过命令行发起请求等）。**
- 本质上讲，XSS 是代码注入问题，**CSRF 是 HTTP 问题。** XSS 是内容没有过滤导致浏览器将攻击者的输入当代码执行。**CSRF 则是因为浏览器在发送 HTTP 请求时候自动带上 cookie，而一般网站的 session 都存在 cookie里面(Token验证可以避免)。**

#### 防御

- 验证码；强制用户必须与应用进行交互，才能完成最终请求。此种方式能很好的遏制 CSRF，但是用户体验比较差。
- Referer check；请求来源限制，此种方法成本最低，但是并不能保证 100% 有效，因为服务器并不是什么时候都能取到 Referer，而且低版本的浏览器存在伪造 Referer 的风险。
- token；**token 验证的 CSRF 防御机制是公认最合适的方案。**若网站同时存在 XSS 漏洞的时候，这个方法也是空谈。

## Express

直接用Node.js内置的 http 模块去开发服务器有以下明显的弊端：

- **需要写很多底层代码**——例如手动指定 HTTP 状态码和头部字段，最终返回内容。如果我们需要开发更复杂的功能，涉及到多种状态码和头部信息（例如用户鉴权），这样的手动管理模式非常不方便
- **没有专门的路由机制**——路由是服务器最重要的功能之一，通过路由才能根据客户端的不同请求 URL 及 HTTP 方法来返回相应内容。但是上面这段代码只能在 `http.createServer` 的回调函数中通过判断请求 `req` 的内容才能实现路由功能，搭建大型应用时力不从心

由此就引出了 Express 对内置 http 的两大封装和改进：

- 更强大的请求（Request）和响应（Response）对象，添加了很多实用方法
- 灵活方便的路由的定义与解析，能够很方便地进行代码拆分

### 用 Express 搭建服务器

在第一步中，我们把服务器放在了一个JS文件中，也就是一个Node模块。从现在开始，我们将把这个项目变成一个npm项目。输入以下命令创建 npm 项目：

```bash
npm init
```

接着你可以一路回车下去（当然也可以仔细填），就会发现 package.json 文件已经创建好了。然后添加 Express 项目依赖：

```bash
npm install express
```

在开始用 Express 改写上面的服务器之前，我们先介绍一下上面提到的**两大封装与改进**。

### 更强大的 Request 和 Response 对象

首先是 Request 请求对象，通常我们习惯用 `req` 变量来表示。下面列举一些 `req` 上比较重要的成员：

- `req.body`：客户端请求体的**数据**，可能是表单或 JSON 数据
- `req.params`：请求 URI 中的**路径**参数
- `req.query`：请求 URI 中的**查询**参数
- `req.cookies`：客户端的 `cookies`

然后是 Response 响应对象，通常用 `res` 变量来表示，可以执行一系列响应操作，例如：

```js
// 发送一串 HTML 代码
res.send('HTML String');

// 发送一个文件
res.sendFile('file.zip');

// 渲染一个模板引擎并发送
res.render('index');
```

Response 对象上的操作非常丰富，并且还可以链式调用：

```js
// 设置状态码为 404，并返回 Page Not Found 字符串
res.status(404).send('Page Not Found');
```

> res.end() 和 res.send()

相同点：

* 二者最终都是回归到  `http.ServerResponse.Use` 的 `response.end()` 方法。
* 二者都会结束当前响应流程。

不同点：

* 前者只能发送 string 或者 Buffer 类型，后者可以发送任何类型数据。
* 从语义来看，前者更适合没有任何响应数据的场景，而后者更适合于存在响应数据的场景。

Express 的 res.end() 和 res.send() 方法使用上，一般建议使用 `res.send()`方法即可，这样就不需要关心响应数据的格式，因为 Express 内部对数据进行了处理。

### 路由机制

客户端（包括 Web 前端、移动端等等）向服务器发起请求时包括两个元素：**路径**（URI）以及 **HTTP 请求方法**（包括 GET、POST 等等）。路径和请求方法合起来一般被称为 API 端点（Endpoint）。而服务器根据客户端访问的端点选择相应处理逻辑的机制就叫做路由。

在 Express 中，定义路由只需按下面这样的形式：

```js
app.METHOD(PATH, HANDLER)
```

其中：

- `app` 就是一个 `express` 服务器对象
- `METHOD` 可以是任何**小写**的 HTTP 请求方法，包括 `get`、`post`、`put`、`delete` 等等
- `PATH` 是客户端访问的 URI，例如 `/` 或 `/about`
- `HANDLER` 是路由被触发时的回调函数，在函数中可以执行相应的业务逻辑

### nodemon 加速开发

[Nodemon](https://link.juejin.cn?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fnodemon) 是一款颇受欢迎的开发服务器，能够检测工作区代码的变化，并自动重启。通过以下命令安装 nodemon：

```js
npm install nodemon --save-dev
```

### 正式实现

到了动手的时候了，我们用 Express 改写上面的服务器，代码如下：

```js
const express = require('express');

const hostname = 'localhost';
const port = 3000;

const app = express();
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

在上面的代码中，我们首先用 `express()` 函数创建一个 Express 服务器对象，然后用上面提到的路由定义方法 `app.get` 定义了主页 `/` 的路由，最后同样调用 `listen` 方法开启服务器。

从这一步开始，我们运行 `npm start` 命令即可开启服务器，并且同样可以看到 Hello World 的内容，但是代码却简单明了了不少。

**提示**

在运行 `npm start` 之后，可以让服务器一直打开着，编辑代码并保存后，`Nodemon` 就会自动重启服务器，运行最新的代码。如果不能自动重启，可以`Ctrl+c`关闭后手动重启。

### 中间件

接下来我们开始讲解 Express 第二个重要的概念：**中间件**（Middleware）。

#### 理解中间件

中间件并不是 Express 独有的概念。相反，它是一种广为使用的软件工程概念（甚至已经延伸到了其他行业），是指**将具体的业务逻辑和底层逻辑解耦的组件**。换句话说，中间件就是能够适用多个应用场景、可复用性良好的代码。

Express 的简化版中间件流程如下图所示：

[![HLcYqK.png](https://s4.ax1x.com/2022/02/20/HLcYqK.png)](https://imgtu.com/i/HLcYqK)

首先客户端向服务器发起请求，然后服务器依次执行每个中间件，最后到达路由，选择相应的逻辑来执行。

有两点需要特别注意：

- 中间件是**按顺序执行**的，因此在配置中间件时顺序非常重要，不能弄错
- 中间件在执行内部逻辑的时候可以选择将请求传递给下一个中间件，也可以直接返回用户响应

#### Express 中间件的定义

在 Express 中，中间件就是一个函数：

```js
function someMiddleware(req, res, next) {
  // 自定义逻辑
  next();
}
```

三个参数中，`req` 和 `res` 就是前面提到的 Request 请求对象和 Response 响应对象；而 `next` 函数则用来触发下一个中间件的执行。

> **注意**
>
> 如果忘记在中间件中调用 `next` 函数，并且又不直接返回响应时，服务器会直接卡在这个中间件不会继续执行下去哦！

在 Express 使用中间件有两种方式：**全局中间件**和**路由中间件**。

#### 全局中间件

通过 `app.use` 函数就可以注册中间件，并且此中间件会在用户发起**任何请求**都可能会执行，例如：

```js
app.use(someMiddleware);
```

#### 路由中间件

通过在路由定义时注册中间件，此中间件只会在用户访问该路由对应的 URI 时执行，例如：

```js
app.get('/middleware', someMiddleware, (req, res) => {
  res.send('Hello World');
});
```

那么用户只有在访问 `/middleware` 时，定义的 `someMiddleware` 中间件才会被触发，访问其他路径时不会触发。

#### 编写中间件

接下来我们就开始实现第一个 Express 中间件。功能很简单，就是在终端打印客户端的访问时间、 HTTP 请求方法和 URI，名为 `loggingMiddleware`。代码如下：

```js
// ...

const app = express();

function loggingMiddleware(req, res, next) {
  const time = new Date();
  console.log(`[${time.toLocaleString()}] ${req.method} ${req.url}`);
  next();
}

app.use(loggingMiddleware);

app.get('/', (req, res) => {
  res.send('Hello World');
});

// ...
```

> **注意**
>
> 在中间件中写 `console.log` 语句是比较糟糕的做法，因为 `console.log`（包括其他同步的代码）都会阻塞 Node.js 的异步事件循环，降低服务器的吞吐率。在实际生产中，推荐使用第三方优秀的日志中间件，例如 [morgan](https://link.juejin.cn?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fmorgan)、[winston](https://link.juejin.cn?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fwinston) 等等。

实际上，中间件不仅可以读取 `req` 对象上的各个属性，还可以添加新的属性或修改已有的属性（后面的中间件和路由函数都可以获取），能够很方便地实现一些复杂的业务逻辑（例如用户鉴权）。

### 添加静态文件服务

通常网站需要提供静态文件服务，例如图片、CSS 文件、JS 文件等等，而 Express 已经自带了静态文件服务中间件 `express.static`，使用起来非常方便。

例如，我们添加静态文件中间件如下，并指定静态资源根目录为 `public`：

```js
// ...

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

// ...
```

`app.use(express.static(__dirname))`，假设我在server.js文件中写入这行代码，那么就是把server.js文件所在的目录设置为静态文件目录。该目录下的`index.html`会被默认打开。

### 处理 404 和服务器错误

[![HLcJr6.png](https://s4.ax1x.com/2022/02/20/HLcJr6.png)](https://imgtu.com/i/HLcJr6)

这张示意图和之前的图有两点重大区别：

- 每个路由定义本质上是一个**中间件**（更准确地说是一个**中间件容器**，可包含多个中间件），当 URI 匹配成功时直接返回响应，匹配失败时继续执行下一个路由
- 每个中间件（包括路由）不仅可以调用 `next` 函数向下传递、直接返回响应，还可以**抛出异常**

从这张图就可以很清晰地看出怎么实现 404 和服务器错误的处理了：

- 对于 404，只需在所有路由之后再加一个中间件，用来接收所有路由均匹配失败的请求
- 对于错误处理，前面所有中间件抛出异常时都会进入错误处理函数，可以使用 Express 自带的，也可以自定义。

#### 处理 404

在 Express 中，可以通过中间件的方式处理访问不存在的路径：

```js
app.use('*', (req, res) => {
  // ...
});
```

`*` 表示匹配任何路径。将此中间件放在所有路由后面，即可捕获所有访问路径均匹配失败的请求。

#### 处理内部错误

Express 已经自带了错误处理机制，我们先来体验一下。在 server.js 中添加下面这条”坏掉“的路由（模拟现实中出错的情形）：

```js
app.get('/broken', (req, res) => {
  throw new Error('Broken!');
});
```

> **危险！**
>
> 服务器直接返回了出错的调用栈！很明显，向用户返回这样的调用栈不仅体验糟糕，而且大大增加了被攻击的风险。

实际上，Express 的默认错误处理机制可以通过设置 `NODE_ENV` 来进行切换。我们将其设置为生产环境 `production`，再开启服务器。如果你在 Linux、macOS 或 Windows 下的 Git Bash 环境中，可以运行以下命令：

```bash
NODE_ENV=production node server.js
```

如果你在 Windows 下的命令行，运行以下命令：

```bash
set NODE_ENV=production
node server.js
```

这时候访问 `localhost:3000/broken` 就会直接返回 Internal Server Error（服务器内部错误），不会显示任何错误信息。

体验还是很不好，更理想的情况是能够返回一个友好的自定义页面。这可以通过 Express 的自定义错误处理函数来解决，错误处理函数的形式如下：

```js
function (err, req, res, next) {
  // 处理错误逻辑
}
```

和普通的中间件函数相比，多了第一个参数，也就是 `err` 异常对象。

### 实现自定义处理逻辑

通过上面的讲解，实现自定义的 404 和错误处理逻辑也就非常简单了。在 server.js 所有路由的后面添加如下代码：

```js
// 中间件和其他路由 ...

app.use('*', (req, res) => {
  res.status(404).render('404', { url: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500');
});

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

> **提示**
>
> 在编写处理 404 的逻辑时，我们用到了模板引擎中的变量插值功能。具体而言，在 `res.render` 方法中将需要传给模板的数据作为第二个参数（例如这里的 `{ url: req.originalUrl }` 传入了用户访问的路径），在模板中就可以通过 `{{ url }}` 获取数据了。

### JSON API

在之前提到的 Response 对象中，Express 为我们封装了一个 `json` 方法，直接就可以将一个 JavaScript 对象作为 JSON 数据返回，例如：

```js
res.json({ name: '百万年薪', price: 996 });
```

会返回 JSON 数据 `{ "name": "百万年薪", "price": 996 }`，状态码默认为 200。我们还可以指定状态码，例如：

```js
res.status(502).json({ error: '公司关门了' });
```

会返回 JSON 数据 `{ "error": "公司关门了"}`，状态码为 502。

### 使用子路由拆分逻辑

当我们的网站规模越来越大时，把所有代码都放在 server.js 中可不是一个好主意。“拆分逻辑”（或者说“模块化”）是最常见的做法，而在 Express 中，我们可以通过子路由 `Router` 来实现。

```js
const express = require('express');
const router = express.Router();
```

`express.Router` 可以理解为一个迷你版的 `app` 对象，但是它功能完备，同样支持注册中间件和路由：

```js
// 注册一个中间件
router.use(someMiddleware);

// 添加路由
router.get('/hello', helloHandler);
router.post('/world', worldHandler);
```

最后，由于 Express 中“万物皆中间件”的思想，一个 `Router` 也作为中间件加入到 `app` 中:

```js
app.use('/say', router);
```

这样 `router` 下的全部路由都会加到 `/say` 之下，即相当于：

```js
app.get('/say/hello', helloHandler);
app.post('/say/world', worldHandler);
```


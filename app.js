var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const proxy = require('express-http-proxy')

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();


//跨域配置
app.use((req, res, next) => {
    res.set({
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Max-Age': 1728000,
        'Access-Control-Allow-Origin': req.headers.origin || '*',
        'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
        'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
        'Content-Type': 'application/json; charset=utf-8'
    })
    req.method === 'OPTIONS' ? res.status(200).end() : next()
})

//代理转发请求配置参数
let opts = {
    preserveHostHdr: true,
    reqAsBuffer: true,
    //转发之前触发该方法
    proxyReqPathResolver: function (req, res) {
        //这个代理会把匹配到的url（下面的 ‘/api’等）去掉，转发过去直接404，这里手动加回来，
        req.url = req.baseUrl + req.url;
        return require('url').parse(req.url).path;
    },
}
//代理转发请求配置启用
app.use('/uatapi', proxy('https://baidu.com/uatapi', opts))
app.use('/simapi', proxy('https://baidu.com/simapi', opts))

app.use("/", indexRouter);
app.use("/users", usersRouter);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// app.listen(3000, () => {
//     console.log('start + port:', 3000)
// })

module.exports = app;

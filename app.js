var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var compression = require('compression');
var LocalStrategy = require('passport-local').Strategy;

//配置MongoDB连接
var db = require('monk')('localhost:27017/test');

var User = require('./models/user');

var app = express();

//配置view engine，即v层
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', require('ejs').renderFile);	//修改ejs后缀为html，方便eclipse
app.set('view engine', 'html');					//修改ejs后缀为html，方便eclipse

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));//dev环境的日志
app.use(compression());//gzip压缩
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));//表示存放静态文件的文件夹

//半被迫使用数据库存放session，不怕重启数据库但是请求效率降低
app.use(session({
	secret: "LamiaLoveless",
	resave: false,
	saveUninitialized: true,
	store: new MongoStore({
		db: "test",
		host: "localhost",
		port: "27017"
	})
}));

//输出当前环境
console.log(app.get('env'));

//配置passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({usernameField:'name' },
		function(name,password,done){
			User.findOne({name:name},function(err,user){
				if (err) {
					return done(err);
				}
				if (!user) {
					return done(null, false, { message: "用户名不存在" });
				}
				if (!user.validPassword(password)) {
					return done(null, false, { message: "用户密码错误" });
				}
				return done(null, user);
			});
		}
));
//session只保存id，每次请求再去数据库取user的方式，有不妥，可以考虑改良
//passport.serializeUser(function(user, done) {
//	done(null, user.id);
//});
//passport.deserializeUser(function(id, done) {
//	User.findById(id, function(err, user) {
//		done(err, user);
//	});
//});
//session存user所有信息，省事但是空间有冗余
passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(user, done) {
	done(null, user);
});

//类似注入的方式，在路由表中注入数据库连接
app.use(function(req,res,next){
	req.db = db;
	next();
});

//配置2个路由表，即c层，整合为1个路由表，分离c层到单独一个文件里面
var routes = require('./routes/index');
app.use('/', routes);

// 捕捉404并跳转向错误处理
app.use(function(req, res, next) {
	res.redirect('/404.html');
//		var error = new Error('Not Found');
//		error.status = 404;
//		next(error);
});

// 错误处理

// 开发环境错误处理
// 打印错误堆栈
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// 生产环境错误处理
// 错误堆栈不泄露给用户
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

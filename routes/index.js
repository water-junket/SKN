var express = require('express');
var router = express.Router();
var User = require('../models/user.js');
var Stock = require('../models/stock.js');
var passport = require('passport');
var session = require('express-session');
var stocks = {};

//登录状态过滤
var isAuthenticated = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login.html');
};

//拆解sessioin中stock字符串，如果没有指定股票则加入
function session_stock(s,code){
	if(!s.stocks) s.stocks="";
	if(s.stocks.indexOf(code)==-1) s.stocks+=","+code;
}

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {
		state: req.isAuthenticated()
	});
});

//按id查询user
router.get('/user/:id.json', function(req, res, next) {
	var db=req.db;
	var collection=db.get("user");
	collection.find({},"-temp",function(e,docs){
		res.json({
			title: 'Express',
			id: req.params.id,
			list: docs
		});
	});
});

//查询已登录user
router.get('/user', isAuthenticated, function(req, res, next) {
	res.render("user", {name: req.user.name});
});

//添加user
router.post('/user', function(req, res, next) {
	User.findOne({name: req.body.name}, function(e,user) {
		if(e||user){
			res.json({message:e||user});
		}else{
			user=new User({name: req.body.name, password: req.body.password});
			user.post();
		}
	});
});

//添加stock
router.post('/stock/add', isAuthenticated, function(req, res, next) {
	var stock=new Stock({title: req.body.title, code: req.body.code});
	stock.post();
	res.json({message:"success"});
//	老方法，用upsert替代了
//	Stock.findOne({code: req.body.code}, function(e,stock) {
//		if(e||stock){
//			res.json({message:e||stock});
//		}else{
//			stock=new Stock({title: req.body.title, code: req.body.code});
//			stock.post();
//			res.json({message:"success"});
//		}
//	});
});

//个股板块
router.get('/stock/:id-:page', function(req, res, next) {
	if(stocks[req.params.id]){
		session_stock(req.session,req.params.id);
		res.render('stock', {stock: stocks[req.params.id]});
	}else{
		Stock.findOne({code: req.params.id}, function(e,stock) {
			if(e) next(e);
			else if(stock){
				stocks[req.params.id]=stock;
				session_stock(req.session,req.params.id);
				res.render('stock', {stock: stock});
			}else res.redirect('/404.html');
		});
	}
});

//获得session中存的访问过的stocks
router.get('/stock/viewed.json', function(req, res, next) {
	res.json(req.session.stocks&&req.session.stocks!==''?req.session.stocks.substring(1).split(","):[]);
});

//删除session中存的访问过的stocks
router.post('/stock/viewed/:id', function(req, res, next) {
	var ta=req.session.stocks.split(",");
	for(var t in ta){
		if(ta[t]==req.params.id){
			ta.splice(t,1);
			break;
		}
	}
	req.session.stocks=ta.join(",");
	res.json();
});

router.get('/logout', function(req, res, next) {
	req.logout();
	res.redirect('/');
});

router.post('/ajax_logout', function(req, res, next) {
	req.logout();
	res.json();
});

router.post('/login', passport.authenticate('local', {
	successRedirect: '/user',
	failureRedirect: '/login.html'
}));

router.post('/ajax_login', passport.authenticate('local'),function(req, res, next){
	res.json(req.user);
});

/* GET hello world page. */
router.get('/helloworld', isAuthenticated, function(req, res, next) {
	res.render('helloworld', { title: 'helloworld' });
});

module.exports = router;

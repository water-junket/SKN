/**
 * New node file
 */
var users = require('monk')('localhost:27017/test').get("user");
var crypto = require('crypto');

function User(user){
	this.name = user.name;
	this.password = user.password;
}

User.findOne = function(user,callback){
	users.findOne(user,function(e,docs){
		callback(e,docs!==null?new User(docs):null);
	});
};

User.findById = function(id,callback){
	users.findOne({_id:id},function(e,docs){
		callback(e,new User(docs));
	});
};

User.prototype.validPassword = function(password){
	var md5 = crypto.createHash("md5");
	password = md5.update(password+this.name+password).digest("base64");//加盐
	return this.password===password;
};

User.prototype.post = function(){
	var md5 = crypto.createHash("md5");
	this.password = md5.update(this.password+this.name+this.password).digest("base64");//加盐
	users.insert(this);
};

module.exports = User;

/**
 * New node file
 */
var posts = require('monk')('localhost:27017/test').get("post");

function Stock(stock){
	this.title = stock.title;
	this.code = stock.code;
	if(this.code.indexOf("00") === 0) this.s_code = "sz"+this.code;
	else if(this.code.indexOf("60") === 0) this.s_code = "sh"+this.code;
}

Stock.findOne = function(stock,callback){
	stocks.findOne(stock,function(e,docs){
		callback(e,docs!==null?new Stock(docs):null);
	});
};

Stock.prototype.post = function(){
	stocks.update({code:this.code},{$set:{title:this.title}},{upsert:true});
};

module.exports = Stock;

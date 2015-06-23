/**
 * New node file
 */
var stocks = require('monk')('localhost:27017/test').get("stock");

function Stock(stock){
	this.title = stock.title;
	this.code = stock.code;
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

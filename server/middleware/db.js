'use strict';

var mysql = require("mysql");
var method = db.prototype;

function db() {
	var con = mysql.createPool({
		host : 'localhost',
	  	user : 'root',
	  	password : '',
	  	database : 'freelance'
	});
	this.connection = con;
}

method.getcon = function() {
	return this;
};

module.exports = db;

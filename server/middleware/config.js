'use strict';

var express = require("express");
var path = require('path'); 
var method = config.prototype;

function config(app) {
	
	app.use('/client', express.static('../client'));
	app.use('/components', express.static('../client/components'));
	app.use('/assets', express.static('../client/assets'));
	app.use('/node_modules', express.static('../node_modules'));
	app.use('/server', express.static('../server'));

	app.get('/*', function(req, res) {
		res.sendFile('index.html', {root: '../client/'});
	});
}

method.get_config = function() {
	return this;
}

module.exports = config;


'use strict';

var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var chatSocket = require('./socket');
var server = require('http').Server(app);
var io = require('socket.io')(server);

io.on('connection', function(socket) {
	chatSocket.respond(socket, io.sockets);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/client', express.static('./client'));
app.use('/node_modules', express.static('./node_modules'));
app.use('/server', express.static('./server'));

app.get('/', function(req, res) {
	res.sendFile('index.html', {root: './client/'});
});

var port = process.env.PORT || 1337;

server.listen(port, function(){
   console.log('Server listening on ' + port);
});


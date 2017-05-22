'use strict';

var bodyParser = require('body-parser');
var helper = require('./helper');
exports.helper = helper;

var method = routes.prototype;

function routes(app, connection,io, sessionInfo) {

	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	var users = [];
	var uid = ""; 
	/*
		Socket event starts
	*/
	io.on('connection', function(socket) {

		var uIdSocket = socket.request.session.uid;
		//Storing users into array as an object
	    socket.on('userInfo', function(userinfo) {
	    	// console.log(userinfo);
	    	/*
	    		Adding Single socket user into 'users' array
	    	*/
			var should_add = true;
	    	if(users.length == 0) {
	    		userinfo.socketId = socket.id;
	    		users.push(userinfo);
	    		// console.log(users);
	    	} else {
	    		users.forEach(function(element, index, array) {
	    			if(element.id == userinfo.id){
			    		should_add = false;	    		
			    	}
				});
				if (should_add) {
					userinfo.socketId = socket.id;
	    			users.push(userinfo);
			    };
	    	}

	    	var data = {
				query: "update users set online='Y' where id='"+userinfo.id+"'",
				connection: connection
			}
			helper.queryRunner(data, function(result) {
				/*
		    		Sending list of users to all users
		    	*/
				users.forEach(function(element, index, array) {
		    		helper.getUserChatList(element.id, connection, function(dbUsers) {
		    			if(dbUsers === null) {
		    				console.log('has one person');
		    				io.to(element.socketId).emit('userEntrance',users);
		    			} else {
		    				console.log('has many person');
		    				helper.mergeUsers(users, dbUsers, 'no', function(mergedUsers) {
		    					io.to(element.socketId).emit('userEntrance',mergedUsers);
		    				});
		    			}	    			
		    		});
				});
			});

	    	should_add = true;
	    });    

	   	/*
			'sendMsg' will save the messages into DB.
	   	*/
	   	socket.on('sendMsg', function(data_server) {
	    	/*
	    		calling saveMsgs to save messages into DB.
	    	*/
	    	helper.saveMsgs(data_server,connection, function(result) {
	    		/*
	    			Chechking users is offline or not
	    		*/
	    		if(data_server.socket_id == null) {
	    			/*
	    				If offline update the Chat list of Sender. 
	    			*/
	    			var singleUser = users.find(function(element) {
	    				return element.id == data_server.from_id;
	    			});	
	    			/*
	    				Calling 'getUserChatList' to get user chat list
	    			*/
					helper.getUserChatList(singleUser.id,connection, function(dbUsers) {
			    		if(dbUsers === null) {
			    			io.to(singleUser.socketId).emit('userEntrance',users);
			    		} else {
			    			/*
	    						Calling 'mergeUsers' to merge online and offline users
	    					*/
			    			helper.mergeUsers(users,dbUsers,'no',function(mergedUsers){
			    				io.to(singleUser.socketId).emit('userEntrance',mergedUsers);
			    			});
			    		}	    			
			    	});
				} else {
					/*
	    				If Online send message to receiver.
	    			*/
	    			io.to(data_server.socket_id).emit('getMsg',result);
	    		}
	    	});	    	  	    
	    });
	    /*
	    	Sending Typing notification to user.
	    */
	    socket.on('setTypingNotification', function(data_server) {	    			
	    	io.to(data_server.data_socket_fromid).emit('getTypingNotification',data_server);
	    });
	    /*
	    	Removig user when user logs out
	    */
	    socket.on('disconnect', function() {
	    	var spliceId = "";
	    	for(var i=0; i < users.length; i++) {
				if(users[i].id == uIdSocket) {
					if(users[i].socketId == socket.id) {					
					  	var data = {
							query: "update users set online='N' where id='"+users[i].id+"'",
							connection: connection
						}
						spliceId = i;
						helper.queryRunner(data, function(result) {
							users.splice(spliceId,1); //Removing single user
							io.emit('exit',users[spliceId]);
						});
					}
				}				
			}

		});
	});
	/*
		Socket event Ends
	*/
	app.post('/get_userinfo', function(req, res) {
		var data = {
			query: "select id,name,p_photo,online from users where id='"+req.body.uid+"'",
			connection: connection
		}
		helper.queryRunner(data, function(result) {
			if(result.length > 0) {
				var user_info = "";			
				result.forEach(function(element, index, array) {
					user_info = element;
				});
		    	var result_send = {
		    		is_logged: true,
		    		data: user_info,
		    		msg:"OK"
		    	};
		    } else {
		    	var result_send = {
		    		is_logged: false,
		    		data: null,
		    		msg: "BAD"
		    	};
		    }   
		    res.write(JSON.stringify(result_send));
			res.end();
		});
	});
	/*
		post to handle get_msgs request
	*/
	app.post('/get_msgs', function(req, res) {
		helper.getMsgs(req.body,connection, function(result) {
			res.write(JSON.stringify(result));
			res.end();
		});		
	});
	/*
		post to handle get_recent_chats request
	*/
	app.post('/get_recent_chats', function(req, res) {
		helper.getUserChatList(req.body.uid,connection, function(dbUsers) {
			res.write(JSON.stringify(dbUsers));
			res.end();
		});	
	});

	/*
		post to handle get_users_to_chats request
	*/
	app.post('/get_users_to_chats', function(req, res) {
		helper.getUsersToChat(req.body.uid, connection, function(dbUsers) {
			helper.mergeUsers(users,dbUsers, 'yes', function(mergedUsers) {
	    		res.write(JSON.stringify(mergedUsers));
	    		res.end();
	    	});			
		});	
	});
	
	app.get('/logout', function(req, res) {
		sessionInfo = req.session;
		var uid= sessionInfo.uid;
		
		var data = {
			query: "update users set online='N' where id='"+uid+"'",
			connection: connection
		}
		helper.queryRunner(data, function(result) {

			req.session.destroy(function(err) {
				if(err) {
			    	console.log(err);
			  	} else {
			  		io.emit('exit',1);
					res.redirect('/');
			  	}

			});
		});
	});
	
}

method.getroutes = function() {
	return this;
}

module.exports = routes;

'use strict';

var	npid = require("npid");
var uuid = require('node-uuid');
var Room = require('./room.js');
var _ = require('underscore')._;

// io.set("log level", 1);
var people = {};
var rooms = {};
var sockets = [];
var chatHistory = {};

function purge(s, action, chat) {

	if (people[s.id].inroom) { //user is in a room
		var room = rooms[people[s.id].inroom]; //check which room user is in.
		if (s.id === room.owner) { //user in room and owns room
			if (action === "disconnect") {
				chat.in(s.room).emit("update", "The owner (" +people[s.id].name + ") has left the server. The room is removed and you have been disconnected from it as well.");
				var socketids = [];
				for (var i=0; i<sockets.length; i++) {
					socketids.push(sockets[i].id);
					if(_.contains((socketids)), room.people) {
						sockets[i].leave(room.name);
					}
				}

				if(_.contains((room.people)), s.id) {
					for (var i=0; i<room.people.length; i++) {
						people[room.people[i]].inroom = null;
					}
				}
				room.people = _.without(room.people, s.id); //remove people from the room:people{}collection
				delete rooms[people[s.id].owns]; //delete the room
				delete people[s.id]; //delete user from people collection
				delete chatHistory[room.name]; //delete the chat history
				var sizePeople = _.size(people);
				var sizeRooms = _.size(rooms);
				chat.emit("update-people", {people: people, count: sizePeople});
				chat.emit("roomList", {rooms: rooms, count: sizeRooms});
				var o = _.findWhere(sockets, {'id': s.id});
				sockets = _.without(sockets, o);
			} else if (action === "removeRoom") { //room owner removes room
				chat.in(s.room).emit("update", "The owner (" +people[s.id].name + ") has removed the room. The room is removed and you have been disconnected from it as well.");
				var socketids = [];
				for (var i=0; i<sockets.length; i++) {
					socketids.push(sockets[i].id);
					if(_.contains((socketids)), room.people) {
						sockets[i].leave(room.name);
					}
				}

				if(_.contains((room.people)), s.id) {
					for (var i=0; i<room.people.length; i++) {
						people[room.people[i]].inroom = null;
					}
				}

				delete rooms[people[s.id].owns];
				people[s.id].owns = null;
				room.people = _.without(room.people, s.id); //remove people from the room:people{}collection
				delete chatHistory[room.name]; //delete the chat history
				sizeRooms = _.size(rooms);
				chat.emit("roomList", {rooms: rooms, count: sizeRooms});
			} else if (action === "leaveRoom") { //room owner leaves room
				chat.in(s.room).emit("update", "The owner (" +people[s.id].name + ") has left the room. The room is removed and you have been disconnected from it as well.");
				var socketids = [];
				for (var i=0; i<sockets.length; i++) {
					socketids.push(sockets[i].id);
					if(_.contains((socketids)), room.people) {
						sockets[i].leave(room.name);
					}
				}

				if(_.contains((room.people)), s.id) {
					for (var i=0; i<room.people.length; i++) {
						people[room.people[i]].inroom = null;
					}
				}
				delete rooms[people[s.id].owns];
				people[s.id].owns = null;
				room.people = _.without(room.people, s.id); //remove people from the room:people{}collection
				delete chatHistory[room.name]; //delete the chat history
				sizeRooms = _.size(rooms);
				chat.emit("roomList", {rooms: rooms, count: sizeRooms});
			}
		} else {//user in room but does not own room
			if (action === "disconnect") {
				chat.emit("update", people[s.id].name + " has disconnected from the server.");
				if (_.contains((room.people), s.id)) {
					var personIndex = room.people.indexOf(s.id);
					room.people.splice(personIndex, 1);
					s.leave(room.name);
				}
				delete people[s.id];
				var sizePeople = _.size(people);
				chat.emit("update-people", {people: people, count: sizePeople});
				var o = _.findWhere(sockets, {'id': s.id});
				sockets = _.without(sockets, o);
			} else if (action === "removeRoom") {
				s.emit("update", "Only the owner can remove a room.");
			} else if (action === "leaveRoom") {
				if (_.contains((room.people), s.id)) {
					var personIndex = room.people.indexOf(s.id);
					room.people.splice(personIndex, 1);
					people[s.id].inroom = null;
					chat.emit("update", people[s.id].name + " has left the room.");
					s.leave(room.name);
				}
			}
		}	
	} else {
		//The user isn't in a room, but maybe he just disconnected, handle the scenario:
		if (action === "disconnect") {
			chat.emit("update", people[s.id].name + " has disconnected from the server.");
			delete people[s.id];
			var sizePeople = _.size(people);
			chat.emit("update-people", {people: people, count: sizePeople});
			var o = _.findWhere(sockets, {'id': s.id});
			sockets = _.without(sockets, o);
		}		
	}
}

module.exports.respond = function(socket, chat) {

	socket.on("joinserver", function(name, device) {
		var exists = false;
		var ownerRoomID = null;
		var inRoomID = null;

		_.find(people, function(key,value) {
			if (key.name.toLowerCase() === name.toLowerCase())
				return exists = true;
		});

		if (exists) {//provide unique username:
			var randomNumber=Math.floor(Math.random()*1001)
			do {
				var proposedName = name+randomNumber;
				_.find(people, function(key,value) {
					if (key.name.toLowerCase() === proposedName.toLowerCase())
						return exists = true;
				});
			} while (!exists);
			socket.emit("exists", {msg: "The username already exists, please pick another one.", proposedName: proposedName});
		} else {
			people[socket.id] = {"name" : name, "owns" : ownerRoomID, "inroom": inRoomID, "device": device};
			socket.emit("update", "You have connected to the server.");
			chat.emit("update", people[socket.id].name + " is online.")
			var sizePeople = _.size(people);
			var sizeRooms = _.size(rooms);
			chat.emit("update-people", {people: people, count: sizePeople});
			socket.emit("roomList", {rooms: rooms, count: sizeRooms});
			socket.emit("joined"); //extra emit for GeoLocation
			sockets.push(socket);
		}
	});

	socket.on("getOnlinePeople", function(fn) {
        fn({people: people});
    });

	socket.on("countryUpdate", function(data) { //we know which country the user is from
		country = data.country.toLowerCase();
		people[socket.id].country = country;
		chat.emit("update-people", {people: people, count: sizePeople});
	});

	socket.on("typing", function(data) {
		if (typeof people[socket.id] !== "undefined") {
			chat.in(socket.room).emit("isTyping", {isTyping: data, person: people[socket.id].name});
		}
	});
	
	socket.on("send", function(msTime, msg) {
		//process.exit(1);
		var re = /^[w]:.*:/;
		var whisper = re.test(msg);
		var whisperStr = msg.split(":");
		var found = false;
		if (whisper) {
			var whisperTo = whisperStr[1];
			var keys = Object.keys(people);
			if (keys.length != 0) {
				for (var i = 0; i<keys.length; i++) {
					if (people[keys[i]].name === whisperTo) {
						var whisperId = keys[i];
						found = true;
						if (socket.id === whisperId) { //can't whisper to ourselves
							socket.emit("update", "You can't whisper to yourself.");
						}
						break;
					} 
				}
			}
			if (found && socket.id !== whisperId) {
				var whisperTo = whisperStr[1];
				var whisperMsg = whisperStr[2];
				socket.emit("whisper", {name: "You"}, whisperMsg);
				chat.socket(whisperId).emit("whisper", msTime, people[socket.id], whisperMsg);
			} else {
				socket.emit("update", "Can't find " + whisperTo);
			}
		} else {
			if (chat.manager.roomClients[socket.id]['/'+socket.room] !== undefined ) {
				chat.in(socket.room).emit("chat", msTime, people[socket.id], msg);
				socket.emit("isTyping", false);
				if (_.size(chatHistory[socket.room]) > 10) {
					chatHistory[socket.room].splice(0,1);
				} else {
					chatHistory[socket.room].push(people[socket.id].name + ": " + msg);
				}
		    } else {
				socket.emit("update", "Please connect to a room.");
		    }
		}
	});

	socket.on("disconnect", function() {
		if (typeof people[socket.id] !== "undefined") { //this handles the refresh of the name screen
			purge(socket, "disconnect", chat);
		}
	});

	//Room functions
	socket.on("createRoom", function(name) {
		if (people[socket.id].inroom) {
			socket.emit("update", "You are in a room. Please leave it first to create your own.");
		} else if (!people[socket.id].owns) {
			var id = uuid.v4();
			var room = new Room(name, id, socket.id);
			rooms[id] = room;
			var sizeRooms = _.size(rooms);
			chat.emit("roomList", {rooms: rooms, count: sizeRooms});
			//add room to socket, and auto join the creator of the room
			socket.room = name;
			socket.join(socket.room);
			people[socket.id].owns = id;
			people[socket.id].inroom = id;
			room.addPerson(socket.id);
			socket.emit("update", "Welcome to " + room.name + ".");
			socket.emit("sendRoomID", {id: id});
			chatHistory[socket.room] = [];
		} else {
			socket.emit("update", "You have already created a room.");
		}
	});

	socket.on("check", function(name, fn) {
		var match = false;
		_.find(rooms, function(key,value) {
			if (key.name === name) {
				return match = true;
			}
		});
		fn({result: match});
	});

	socket.on("removeRoom", function(id) {
		var room = rooms[id];
		if (socket.id === room.owner) {
			purge(socket, "removeRoom", chat);
		} else {
            socket.emit("update", "Only the owner can remove a room.");
		}
	});

	socket.on("joinRoom", function (id) {
		if (typeof people[socket.id] !== "undefined") {
			var room = rooms[id];
			if (socket.id === room.owner) {
				socket.emit("update", "You are the owner of this room and you have already been joined.");
			} else {
				if (_.contains((room.people), socket.id)) {
					socket.emit("update", "You have already joined this room.");
				} else {
					if (people[socket.id].inroom !== null) {
				    	socket.emit("update", "You are already in a room ("+rooms[people[socket.id].inroom].name+"), please leave it first to join another room.");
				    } else {
						room.addPerson(socket.id);
						people[socket.id].inroom = id;
						socket.room = room.name;
						socket.join(socket.room);
						user = people[socket.id];
						chat.in(socket.room).emit("update", user.name + " has connected to " + room.name + " room.");
						socket.emit("update", "Welcome to " + room.name + ".");
						socket.emit("sendRoomID", {id: id});
						var keys = _.keys(chatHistory);
						if (_.contains(keys, socket.room)) {
							socket.emit("history", chatHistory[socket.room]);
						}
					}
				}
			}
		} else {
			socket.emit("update", "Please enter a valid name first.");
		}
	});

	socket.on("leaveRoom", function(id) {
		var room = rooms[id];
		if (room) {
			purge(socket, "leaveRoom", chat);
		}
	});
}
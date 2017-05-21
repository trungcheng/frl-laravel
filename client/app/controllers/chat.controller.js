(function() {
    'use strict';

    angular
        .module('Freelance')
        .controller('ChatController', ChatController);

    function ChatController($rootScope, $scope, $http, $state, $cookieStore, $location, ToastFactory, socket) {

    	$scope.myRoomID = null;
    	$scope.typing = false;
  		$scope.timeout = undefined;

  		$scope.timeoutFunction = function() {
    		$scope.typing = false;
    		socket.emit("typing", false);
  		}

    	$scope.zeroPad = function(num, size) {
		  	var s = num + "";
		  	while (s.length < size)
		    	s = "0" + s;
		  	return s;
		}

		// Format the time specified in ms from 1970 into local HH:MM:SS
		$scope.timeFormat = function(msTime) {
		  	var d = new Date(msTime);
		  	
		  	return $scope.zeroPad(d.getHours(), 2) + ":" +
		    	$scope.zeroPad(d.getMinutes(), 2) + ":" +
		    	$scope.zeroPad(d.getSeconds(), 2) + " ";
		}

    	$scope.loadInit = function () {
    		var name = $rootScope.rootAuth.name;
		    var device = "desktop";
		    if (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i)) {
		      	device = "mobile";
		    }
		    socket.emit("joinserver", name, device);
		    $("#msg").focus();
    	}

    	$scope.chatForm = function () {
		    if ($scope.message !== "") {
		      	socket.emit("send", new Date().getTime(), $scope.message);
		      	$scope.message = "";
		    }
    	}

    	$("#msg").keypress(function(e) {
		    if (e.which !== 13) {
		      	if ($scope.typing === false && $scope.myRoomID !== null && $("#msg").is(":focus")) {
		        	$scope.typing = true;
		        	socket.emit("typing", true);
		      	} else {
		        	clearTimeout($scope.timeout);
		        	$scope.timeout = setTimeout($scope.timeoutFunction(), 5000);
		      	}
		    }
		});

		socket.on("isTyping", function(data) {
		    if (data.isTyping) {
		      	if ($("#"+data.person+"").length === 0) {
		        	$("#updates").append("<li id='"+ data.person +"'><span class='text-muted'><small><i class='fa fa-keyboard-o'></i> " + data.person + " is typing.</small></li>");
		        	$scope.timeout = setTimeout($scope.timeoutFunction(), 5000);
		      	}
		    } else {
		      	$("#"+data.person+"").remove();
		    }
		});

		$scope.createRoom = function () {
		    $scope.roomExists = false;
		    $scope.roomName = $("#createRoomName").val();
		    socket.emit("check", $scope.roomName, function(data) {
		      	$scope.roomExists = data.result;
		       	if ($scope.roomExists) {
		          	$("#errors").empty();
		          	$("#errors").show();
		          	$("#errors").append("Room <i>" + $scope.roomName + "</i> already exists");
		        } else {      
		        	if ($scope.roomName.length > 0) { //also check for roomname
		          		socket.emit("createRoom", $scope.roomName);
		          		$("#errors").empty();
		          		$("#errors").hide();
		          	}
		        }
		    });
		};

		$("#rooms").on('click', '.joinRoomBtn', function() {
		    var roomName = $(this).siblings("span").text();
		    var roomID = $(this).attr("id");
		    socket.emit("joinRoom", roomID);
		});

		$("#rooms").on('click', '.removeRoomBtn', function() {
		    var roomName = $(this).siblings("span").text();
		    var roomID = $(this).attr("id");
		    socket.emit("removeRoom", roomID);
		    $("#createRoom").show();
		});

		$("#leave").click(function() {
		    var roomID = $scope.myRoomID;
		    socket.emit("leaveRoom", roomID);
		    $("#createRoom").show();
		});

		$("#people").on('click', '.whisper', function() {
		    var name = $(this).siblings("span").text();
		    $("#msg").val("w:"+name+":");
		    $("#msg").focus();
		}); 

		socket.on("exists", function(data) {
		  	$("#errors").empty();
		  	$("#errors").show();
		  	$("#errors").append(data.msg + " Try <strong>" + data.proposedName + "</strong>");
		});

		socket.on("joined", function() {
		  	$("#errors").hide();
		  	if (navigator.geolocation) { //get lat lon of user
		    	navigator.geolocation.getCurrentPosition(positionSuccess, positionError, { enableHighAccuracy: true });
		  	} else {
		    	$("#errors").show();
		    	$("#errors").append("Your browser is ancient and it doesn't support GeoLocation.");
		  	}
		  	function positionError(e) {
		    	console.log(e);
		  	}

		  	function positionSuccess(position) {
		    	var lat = position.coords.latitude;
		    	var lon = position.coords.longitude;
		    	//consult the yahoo service
		    	$.ajax({
		      		type: "GET",
		      		url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.placefinder%20where%20text%3D%22"+lat+"%2C"+lon+"%22%20and%20gflags%3D%22R%22&format=json",
		      		dataType: "json",
		       		success: function(data) {
		        		// socket.emit("countryUpdate", {country: data.query.results.Result.countrycode});
		      		}
		    	});
		  	}
		});

		socket.on("history", function(data) {
		  	if (data.length !== 0) {
		    	$("#msgs").append("<li><strong><span class='text-warning'>Last 10 messages:</li>");
		    	$.each(data, function(data, msg) {
		      		$("#msgs").append("<li><span class='text-warning'>" + msg + "</span></li>");
		    	});
		  	} else {
		    	$("#msgs").append("<li><strong><span class='text-warning'>No past messages in this room.</li>");
		  	}
		});

		socket.on("update", function(msg) {
		    $("#msgs").append("<li>" + msg + "</li>");
		});

		socket.on("update-people", function(data){
		    //var peopleOnline = [];
		    var html = "";
		    $("#people").empty();
		    $('#people').append("<li class=\"list-group-item active\">People online <span class=\"badge\">"+data.count+"</span></li>");
		    $.each(data.people, function(a, obj) {
		      	if (!("country" in obj)) {
		        	html = "";
		      	} else {
		        	html = "<img class=\"flag flag-"+obj.country+"\"/>";
		      	}
		    $('#people').append("<li class=\"list-group-item\"><span>" + obj.name + "</span> <i class=\"fa fa-"+obj.device+"\"></i> " + html + " <a href=\"#\" class=\"whisper btn btn-xs\">whisper</a></li>");
		      	//peopleOnline.push(obj.name);
		    });
		});

		socket.on("chat", function(msTime, person, msg) {
		    $("#msgs").append("<li><strong><span class='text-success'>" + $scope.timeFormat(msTime) + person.name + "</span></strong>: " + msg + "</li>");
		    //clear typing field
		    $("#"+person.name+"").remove();
		    clearTimeout($scope.timeout);
		    $scope.timeout = setTimeout($scope.timeoutFunction(), 0);
		});

		socket.on("whisper", function(msTime, person, msg) {
		    if (person.name === "You") {
		      	s = "whisper"
		    } else {
		      	s = "whispers"
		    }
		    $("#msgs").append("<li><strong><span class='text-muted'>" + $scope.timeFormat(msTime) + person.name + "</span></strong> "+s+": " + msg + "</li>");
		});

		socket.on("roomList", function(data) {
		    $("#rooms").text("");
		    $("#rooms").append("<li class=\"list-group-item active\">List of rooms <span class=\"badge\">"+data.count+"</span></li>");
	     	if (!jQuery.isEmptyObject(data.rooms)) { 
	      		$.each(data.rooms, function(id, room) {
	        		var html = "<button id="+id+" class='joinRoomBtn btn btn-default btn-xs' >Join</button>" + " " + "<button id="+id+" class='removeRoomBtn btn btn-default btn-xs'>Remove</button>";
	        		$('#rooms').append("<li id="+id+" class=\"list-group-item\"><span>" + room.name + "</span> " + html + "</li>");
	      		});
	    	} else {
	      		$("#rooms").append("<li class=\"list-group-item\">There are no rooms yet.</li>");
	    	}
		});

		socket.on("sendRoomID", function(data) {
		    $scope.myRoomID = data.id;
		});

		socket.on("disconnect", function() {
		    $("#msgs").append("<li><strong><span class='text-warning'>The server is not available</span></strong></li>");
		    $("#msg").attr("disabled", "disabled");
		    $("#send").attr("disabled", "disabled");
		});

    }

})();
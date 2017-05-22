Freelance.service('runajax', ['$http', function ($http) {
  
  	this.runajax_function = function(request,callback) {
		var url = request.url;
		var data_server = request.data_server;
		$http.post(url,data_server).success(function(data, status, headers, config) {
	  		callback(data);
		})
		.error(function() {
	  		callback("data");
		});
  	}
  	
}]);
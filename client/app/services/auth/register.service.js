(function() {
    'use strict';

    angular
        .module('Freelance')
        .service('RegisterService', RegisterService);

    function RegisterService ($http, Server) {

    	this.postRegister = function(Credential) {
            return $http.post(Server.API_LARAVEL + '/api/v1/signup', Credential);
        }
    	
    }

})();
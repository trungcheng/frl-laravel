(function() {
    'use strict';

    angular
        .module('Freelance')
        .service('LoginService', LoginService);

    function LoginService ($http, Server) {

    	this.postLogin = function(Credential) {
            return $http.post(Server.API_LARAVEL + '/api/v1/authenticate', Credential);
        }
    	
    }

})();
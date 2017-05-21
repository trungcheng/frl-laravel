(function() {
    'use strict';

    angular
        .module('Freelance')
        .controller('LoginController', LoginController);

    function LoginController($rootScope, $scope, $http, $state, $cookieStore, $location, ToastFactory, LoginService) {

    	$scope.Credential = {};

		$scope.Credential = {
			email:null,
			password:null
		}
		
		if($location.search().stt) {
			var query = $location.search().stt;
			var msg = query.replace(/-/g, " ");
			ToastFactory.popSuccess(msg);
		}

		$scope.login = function() {
			LoginService.postLogin($scope.Credential).success(function(response){
				if(response.status) {
					$cookieStore.put('member',response.data.member);
					$cookieStore.put('token',response.data.token);
					// $cookieStore.put('time_out',response.data.token);
					ToastFactory.popSuccess(response.message);
					$state.go('app.dashboard');
				} else {
					if(response.message == 'Your email wrong !'){
						$scope.Credential = {
							email:null,
							password:$scope.Credential.password
						}
						ToastFactory.popErrors(response.message);
					} else {
						$scope.Credential = {
							email:$scope.Credential.email,
							password:null
						}
						ToastFactory.popErrors(response.message);
					}
				}
			})
		}

    }

})();
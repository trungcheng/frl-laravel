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
			LoginService.postLogin($scope.userLogin).success(function(response){
				if(response.status) {
					LoginService.getLoginUser({token: response.token}).success(function (res) {
						if (res.status) {
							$cookieStore.put('member',res.member);
							$cookieStore.put('token',res.token);
							// $cookieStore.put('time_out',response.data.token);
							ToastFactory.popSuccess(response.message);
							$state.go('app.dashboard');	
						} else {
							ToastFactory.popErrors(response.message);
						}
					});
				} else {
					ToastFactory.popErrors(response.message);
				}
			})
		}

    }

})();
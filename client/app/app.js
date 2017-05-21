var Freelance = angular.module('Freelance', [
    "ui.router",
    "ui.bootstrap",
    "ngSanitize",
    "pascalprecht.translate",
    "LocalStorageModule",
    "toaster",
    "ngCookies"
]);

// Connect with socket.io NodeJs
Freelance.factory('socket',function () {
    var socket = io.connect('http://127.0.0.1:1337');
    return socket;
});

Freelance.run(function($rootScope, $state,$interval, $location, $http, $cookieStore) {
    $rootScope.$state = $state;
    $rootScope.rootAuth = null;
    $rootScope.rootAuthToken = null;

    $rootScope.$on('$stateChangeSuccess', function(event, toState) {
        $state.current = toState;
        $rootScope.rootAuth = $cookieStore.get('member');
        $rootScope.rootAuthToken = $cookieStore.get('token');
        if ($rootScope.rootAuth == null || $rootScope.rootAuth == undefined) {
            if($state.current.name != 'access.register' && $state.current.name != 'access.password_reset'){
                $location.path('access/login');
            } else {
                if($state.current.name == 'access.register') {
                    $location.path('access/register');
                } else {
                    $location.path('access/password_reset');
                }
            }
        } else {
            $state.current = toState;
            if ($state.current.name == 'access.login') {
                $location.path('app/dashboard');
            }
        }
    });

    $rootScope.logout = function() {
        $cookieStore.remove('member');
        $cookieStore.remove('token');
        $location.path('access/login');
    }
});

Freelance.config(function($httpProvider) {

    $httpProvider.interceptors.push(['$q', '$location','$cookieStore', function($q, $location,$cookieStore) {
        return {
            'request': function(config) {
                config.headers = config.headers || {};
                if ($cookieStore.get('token') != null) {
                    config.headers['x-access-token'] = $cookieStore.get('token');
                    $cookieStore.remove('time_out');
                }
                return config;
            },
            'responseError': function(response) {
                if (response.status === 401) {
                    $cookieStore.remove('token');
                    $cookieStore.remove('member');
                    $cookieStore.remove('time_out');
                    $location.path('access/login');
                }
                return $q.reject(response);
            }
        };
    }]);
});
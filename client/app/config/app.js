/* Setup config */ 
Freelance.factory('config', ['$rootScope', function($rootScope) {

    var config = {
        enableClientAuthExpire: false, // if client not send request to server then auto invalidate token
        timeDelayCheckAuthExpire: 1*60000, // 5 minute (time delay check user request)
        timeExpireAuth: 2*60000, // 30 minute . after 30 minute user do not sent request to server then token is invalidate
    };

    $rootScope.config = config;

    return config;
}]);
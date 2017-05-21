Freelance.config(["$locationProvider", "$urlRouterProvider", "$stateProvider", 
    function($locationProvider, $urlRouterProvider, $stateProvider) {
        // Redirect any unmatched url
        $urlRouterProvider.otherwise("/access/login");
        // $locationProvider.html5Mode(true);
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

        $stateProvider
            .state('access', {
                url: "/access",
                template: '<div ui-view=""></div>'
            })
            .state('access.login', {
                url: "/login",
                templateUrl: "/client/views/auth/login.html",
                controller: 'LoginController',
                data: {
                    pageTitle: 'Login'
                }
            })
            .state('access.register', {
                url: "/register",
                templateUrl: "/client/views/auth/register.html",
                controller: 'RegisterController',
                data: {
                    pageTitle: 'Register'
                }
            })
            .state('access.password_reset', {
                url: "/password_reset",
                templateUrl: "/client/views/auth/password_reset.html",
                controller: 'PasswordResetController',
                data: {
                    pageTitle: 'Reset password'
                }
            })

            .state('app', {
                url: "/app",
                templateUrl: "/client/views/app.html",
            })
            .state('app.dashboard', {
                url: "/dashboard",
                templateUrl: "/client/views/dashboard.html",
                controller: "DashboardController",
                data: {
                    pageTitle: 'Dashboard'
                }
            })
            .state('app.chat', {
                url: "/chat",
                templateUrl: "/client/views/chat.html",
                controller: "ChatController",
                data: {
                    pageTitle: 'Chat'
                }
            })

    }
]);
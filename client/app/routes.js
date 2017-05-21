Freelance.config(function($stateProvider, $urlRouterProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/access/login");

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

    .state('app.dashboard', {
        url: "/app/dashboard",
        templateUrl: "/client/views/dashboard.html",
        data: {
            pageTitle: 'Dashboard'
        },
        controller: "DashboardController",
    })
    .state('app.chat', {
        url: "/app/chat",
        templateUrl: "/client/views/chat.html",
        data: {
            pageTitle: 'Chat'
        },
        controller: "ChatController",
    })
});
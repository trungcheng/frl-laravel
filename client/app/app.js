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
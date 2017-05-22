Freelance.directive('fileModel', ['$parse', function($parse){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function() {
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                })
            })
        }
    }
}]);

Freelance.directive('sendTypingNotification', function () {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function (scope, element, attrs,ctrl) {
            element.bind("keydown keypress", function (event) {
                scope.self.sendTypingNotification(event.type);
                scope.send_text = element.val();
            });
            scope.$watch(attrs.updateModel, function(value) {
                ctrl.$setViewValue(value);
                ctrl.$render();
            });
        }
    }      
});
$.noty.defaults = {
    layout: 'bottomCenter',
    theme: 'defaultTheme',
    callback: {
        onShow: function() {},
        afterShow: function() {},
        onClose: function() {},
        afterClose: function() {}
    },
    animation: {
        open: {height: 'toggle'},
        close: {height: 'toggle'},
        easing: 'swing',
        speed: 200 // opening & closing animation speed
    },
    timeout: 3000,
    closeWith: ['click'],
    template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
};

angular.module('app', ['directives', 'filters', 'ngSanitize', 'leads', 'providers'])

    .config(function($interpolateProvider) {
        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');
    })

    .config(function($routeProvider) {
        $routeProvider
            .otherwise({redirectTo : '/dashboard'});
    })

    .filter('pagination', function(){
        return function(inputArray, selectedPage, pageSize) {
            var start = (selectedPage - 1)*pageSize;
            return inputArray.slice(start, start + pageSize);
        };
    })

    .filter('length', function(){
        return function(input) {
            return (input !== undefined)? input.length : 0;
        };
    })

    .controller('BaseCtrl', ['$scope', function($scope) {
        $scope.isViewLoading = false;
        $scope.$on('$routeChangeStart', function() {
            $scope.isViewLoading = true;
        });
        $scope.$on('$routeChangeSuccess', function() {
            $scope.isViewLoading = false;
        });
    }])
;
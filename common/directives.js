angular.module('directives', [])
    .directive('bsNavbar', ['$location', function(location) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs, controller) {
                scope.$watch(function() {
                    return location.path();
                }, function(newValue, oldValue) {
                    $('.active', element).removeClass('active');
                    $('li[data-match-route]', element).each(function(k, li) {
                        var $li = angular.element(li),
                            // data('match-rout') does not work with dynamic attributes
                            pattern = $li.attr('data-match-route'),
                            // regexp = new RegExp('^' + pattern + '$', ['i']);
                            regexp = new RegExp('^' + patternx, ['i']);

                        if(regexp.test(newValue)) {
                            $li.addClass('active');
                        } else {
                            $li.removeClass('active');
                        }

                    });
                });
            }
        };
    }])

    .directive('scrollOnClick', function() {
        return {
            restrict: 'A',
            link: function(scope, $elm) {
                $elm.on('click', function() {
                $("body").animate({scrollTop: 0}, "slow");
            });
        }
    };
})
;
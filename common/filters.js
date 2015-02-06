angular.module('filters', [])
    .filter('nl2br', function() {
        return function(text) {
            return (text !== null && text !== undefined)? text.replace(/\n/g, '<br/>') : '';
        };
    })
;
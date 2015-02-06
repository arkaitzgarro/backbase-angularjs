angular.module('common', ['ngResource'])
    .factory('Countries', function($resource){
        return $resource('http://api.domainn.com/countries/:id',
            {
                apiKey: 'secret_key',
                id: '@id.$oid'
            }
        );
    })
;
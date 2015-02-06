angular.module('leads', ['common', 'ngResource', 'ngRoute', 'ui.bootstrap'])

    .config(function($routeProvider) {

        $routeProvider
          .when('/leads/list',  {
              templateUrl: 'app/leads/list.tpl.html',
              controller : 'LeadsController',
              resolve    : {
                  leads : function($route, Leads) {
                      return Leads.query();
                  }
              }
          })
          .when('/leads/new',  {
              templateUrl: 'app/leads/edit.tpl.html',
              controller : 'LeadsEditController',
              resolve    : {
                  lead : function(Leads) {
                      return new Leads();
                  },
                  action : function() {
                      return 'NEW';
                  }
              }
          })
          .when('/leads/view/:id',  {
              templateUrl: 'app/leads/view.tpl.html',
              controller : 'LeadsViewController',
              resolve    : {
                  lead : function($route, Leads) {
                      return Leads.get({id: $route.current.params.id});
                  }
              }
          })
          .when('/leads/edit/:id',  {
              templateUrl: 'app/leads/edit.tpl.html',
              controller : 'LeadsEditController',
              resolve    : {
                  lead : function($route, Leads) {
                      return Leads.get({id: $route.current.params.id});
                  },
                  action : function() {
                      return 'EDIT';
                  }
              }
          })
          .when('/leads/delete/:id',  {
              templateUrl: 'app/tpls/leads/delete.tpl.html',
              controller : 'LeadsController',
              resolve    : {
                  lead : function($route, Leads) {
                      return Leads.get({id: $route.current.params.id});
                  }
              }
          });
    })

    .config(function(paginationConfig) {
        paginationConfig.itemsPerPage = 25;
    })

    .factory('Leads', function($resource){
        var Leads = $resource('http://api.domain.com/leads/:id',
            {
                apiKey: 'secret_key',
                id: '@id.$oid'
            },
            {
                update: {method: 'PUT', params: {id: '@id.$oid'}}
            });

        Leads.prototype.getId = function() {
            return this.id;
        };

        return Leads;
    })

    .controller('LeadsController', ['$scope', '$modal', 'leads', function($scope, $modal, leads) {

        $scope.leads = leads;

        // Pagination
        // Total number of items in all pages.
        $scope.bigTotalItems = $scope.leads.length;
        // Current page number.
        $scope.bigCurrentPage = 1;
        // Limit number for pagination size.
        $scope.maxSize = 10;
        $scope.itemsPerPage = 25;

        $scope.$watch('filteredLeads.length', function(filteredSize){
            $scope.bigTotalItems = filteredSize;
        });

        $scope.setPage = function (pageNo) {
            if (pageNo >=0 && pageNo < $scope.numPages.length) {
                $scope.currentPage = pageNo;
            }
        };

        // Sorting
        $scope.sortField = 'name';
        $scope.reverse   = false;

        $scope.sort = function(fieldName) {
            if($scope.sortField === fieldName) {
                $scope.reverse = !$scope.reverse;
            } else {
                $scope.sortField = fieldName;
                $scope.reverse = false;
            }
        };

        $scope.isSortUp = function(fieldName) {
            return $scope.sortField === fieldName && !$scope.reverse;
        };

        $scope.isSortDown = function(fieldName) {
            return $scope.sortField === fieldName && $scope.reverse;
        };

        $scope.notSorting = function(fieldName) {
            return $scope.sortField !== fieldName;
        };

        // Modal window for lead delete
        $scope.delete = function(lead) {
            var modalInstance = $modal.open({
                templateUrl: 'app/leads/delete.tpl.html',
                controller: LeadModalInstanceCtrl,
                // TODO: show all dependencies
                resolve: {
                    lead: function () {
                        return lead;
                    }
                }
            });

            modalInstance.result.then(function(lead) {
                lead.$remove({id : lead.id}, function() {

                });
              }, function () {
            });
        };
    }])

    .controller('LeadsViewController', function($scope, $http, $route, lead){
        $scope.lead = lead;

        lead.$promise.then(function(lead) {
            // Get bookings
            $http.get('http://api.domain.com/leads/'+lead.id+'/bookings')
            .success(function(data, status, headers, config) {
                $scope.lead.bookings = data;
            })
            .error(function(data, status, headers, config) {
                var n = noty({text: '<strong>Error</strong><br /><br />Something went wrong trying to load lead bookings.', type: 'error'});
            });

            // Get itineraries
            $http.get('http://api.domain.com/leads/'+lead.id+'/itineraries')
            .success(function(data, status, headers, config) {
                $scope.lead.itineraries = data;
            })
            .error(function(data, status, headers, config) {
                var n = noty({text: '<strong>Error</strong><br /><br />Something went wrong trying to load lead itineraries.', type: 'error'});
            });

            // Get invoices
            $http.get('http://api.domain.com/leads/'+lead.id+'/invoices')
            .success(function(data, status, headers, config) {
                $scope.lead.invoices = data;
            })
            .error(function(data, status, headers, config) {
                var n = noty({text: '<strong>Error</strong><br /><br />Something went wrong trying to load lead invoices.', type: 'error'});
            });
        });
    })

    .controller('LeadsEditController', function($scope, $timeout, $modal, $location, lead, action, Countries){
        $scope.lead = lead;
        $scope.action = action;

        $scope.countries = Countries.query(function(countries) {

        });

        $scope.alerts = [];

        if($scope.action === 'NEW')
            $scope.actionText = 'Add new lead';
        else
            $scope.actionText = 'Edit ';

        $scope.canSave = function() {
            return $scope.leadForm.$dirty && $scope.leadForm.$valid;
        };

        $scope.getCssClasses = function(ngModelController) {
            return {
                'has-error' : ngModelController.$invalid && ngModelController.$dirty,
                'has-success' : ngModelController.$valid && ngModelController.$dirty
            };
        };

        $scope.showError = function(ngModelController, error) {
            return ngModelController.$error[error];
        };

        $scope.isNew = function() {
           return ($scope.action === 'NEW');
        };

        $scope.isEdit = function() {
            return ($scope.action === 'EDIT');
        };

        $scope.submit = function() {
            if($scope.action === 'NEW') {
                $scope.lead.$save(function() {
                    // $scope.alerts.push({title: "Item created!", msg: "This lead was succesfully created.", type: "success"});
                    // $timeout(function(){
                    //   $scope.alerts.length = 0;
                    // }, 5000);
                    var n = noty({text: '<strong>Item created!</strong><br /><br />This lead was succesfully created.', type: 'success'});
                    $scope.action = 'EDIT';
                }, function(data) {
                    var n = noty({text: '<strong>Error</strong><br /><br />'+data.data.moreInfo, type: 'error'});
                });
            } else {
              $scope.lead.$update({id: $scope.lead.id}, function() {
                  // $scope.alerts.push({title: "Item saved!", msg: "This lead was succesfully saved.", type: "success"});
                  // $timeout(function(){
                  //   $scope.alerts.length = 0;
                  // }, 5000);
                  var n = noty({text: '<strong>Item saved!</strong><br /><br />This lead was succesfully saved.', type: 'success'});
              }, function(data) {
                  var n = noty({text: '<strong>Error</strong><br /><br />'+data.data.moreInfo, type: 'error'});
              });
            }
        };

        // Modal window for lead delete
        $scope.delete = function() {
            var modalInstance = $modal.open({
                templateUrl: 'app/leads/delete.tpl.html',
                controller: LeadModalInstanceCtrl,
                // TODO: show all dependencies
                resolve: {
                    lead: function () {
                        return $scope.lead;
                    }
                }
            });

            modalInstance.result.then(function(lead) {
                lead.$remove({id : lead.id}, function() {
                    $location.path('/leads/list');
                });
            }, function () {
            });
        };
    })
;

var LeadModalInstanceCtrl = function ($scope, $modalInstance, lead) {

    $scope.lead = lead;

    $scope.confirmDelete = function () {
        $modalInstance.close($scope.lead);
    };

    $scope.cancelDelete = function () {
        $modalInstance.dismiss('cancel');
    };
};
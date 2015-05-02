'use strict';

var oManagement = angular.module('ntApp.management', ['ui.router', 'designServices']);

oManagement.config(['$stateProvider', '$httpProvider', function($stateProvider, $httpProvider) {

}]);

oManagement.controller('ManagementControl', ['$scope', '$stateParams', '$state', 'Design', 
    function($scope, $stateParams, $state, Design) {
        var oParam = {
            action: 'getOrders',
            type: 'all'
        }
        Design.DesignManager.query(oParam, function(oData) {
            $scope.aOrders = oData.data;
        });
    }

]);
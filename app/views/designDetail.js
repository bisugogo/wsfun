'use strict';

var designDetail = angular.module('ntApp.designDetail', ['ui.router', 'designServices', 'ntApp.createOrder']);

designDetail.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('createOrder', {
        url: '/createOrder',
        templateUrl: 'views/createOrder.html',
        controller: 'CreateOrderCtrl',
        params: {designId: null}
    });
}]);

designDetail.controller('DesignDetailCtrl', ['$scope', '$stateParams', '$state', 'Design', function($scope, $stateParams, $state, Design) {
    $scope.designInfo = {};

    $scope.designInfo.designId = $stateParams.designId;

    var oDesign = Design.DesignManager.query({action: "getMyDesignById", designId: $scope.designInfo.designId}, function () {
        $scope.designInfo = oDesign.designDetail;
        $scope.designInfo.designId = $scope.designInfo._id;
    });

    $scope.onOrderBtnClicked = function() {
        $state.go('createOrder', {designId: $scope.designInfo.designId});
    };
}]);
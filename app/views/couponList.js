'use strict';

angular.module('ntApp.couponList', ['ui.router', 'designServices'])
.controller('CouponListCtrl', ['$scope', '$stateParams', '$state', 'Design', function($scope, $stateParams, $state, Design) {
    $scope.height = window.innerHeight;
}]);
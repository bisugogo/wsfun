'use strict';

angular.module('ntApp.myInfo', ['ui.router', 'designServices'])
.controller('MyInfoCtrl', ['$scope', '$stateParams', '$state', 'Design', function($scope, $stateParams, $state, Design) {
    $scope.height = window.innerHeight;
}]);
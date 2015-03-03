'use strict';

angular.module('ntApp.designDetail', ['ui.router', 'designServices'])

// .config(['$stateProvider', function($stateProvider) {
//     $stateProvider.state('design.designId', {
//         url: '/design/:designId',
//         templateUrl: 'views/designDetail.html',
//         controller: 'DesignDetailCtrl'
//     });
// }])

.controller('DesignDetailCtrl', ['$scope', '$stateParams', 'Design', function($scope, $stateParams, Design) {
    $scope.designInfo = {};

    $scope.designInfo.designId = $stateParams.designId;

    var oDesign = Design.DesignManager.query({action: "getMyDesignById", designId: $scope.designInfo.designId}, function () {
        $scope.designInfo = oDesign.designDetail;
        $scope.designInfo.designId = $scope.designInfo._id;
    });
}]);
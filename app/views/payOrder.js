var payOrder = angular.module('ntApp.payOrder', [
    'ui.router', 
    'uiDataServices'
]);

// orderList.config(['$stateProvider', function($stateProvider) {
//     $stateProvider.state('myDesigns', {
//         url: '/myDesigns',
//         templateUrl: 'views/myDesigns.html',
//         controller: 'MyDesignsListCtrl'
//     });
// }]);

payOrder.controller('PayOrderCtrl', ['$scope', '$state', 'Design', 'Auth', 'UIData', function($scope, $state, Design, Auth, UIData) {
    $scope.designCount = UIData.getData('designCount');

    $scope.onPayClicked = function() {
        var oAuthParam = {
            action: 'createPreOrder',
            //wechatId: $scope.test.larry.openId
        };
        Auth.AuthManager.update(oAuthParam, function(oData) {
            //$scope.test.larry._id = oData.data._id;
        });
    };
}]);
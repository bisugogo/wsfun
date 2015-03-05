var orderList = angular.module('ntApp.orderList', [
    'ui.router', 
    'designServices'
]);

// orderList.config(['$stateProvider', function($stateProvider) {
//     $stateProvider.state('myDesigns', {
//         url: '/myDesigns',
//         templateUrl: 'views/myDesigns.html',
//         controller: 'MyDesignsListCtrl'
//     });
// }]);

orderList.controller('OrderListCtrl', ['$scope', '$state', 'Design', function($scope, $state, Design) {
    var oResult = Design.DesignManager.query({action: 'getMyOrders', userId: 'MATT'}, function () {
        var aModelOrder = [];
        for (var i = 0; i < oResult.orderList.length; i++) {
            var oDesignOrders = oResult.orderList[i];
            for (var j = 0; j < oDesignOrders.orders.length; j++) {
                var oOrder = oDesignOrders.orders[j];
                oOrder.sDesignId = oDesignOrders.designId;
                oOrder.sDesignDesc = oDesignOrders.desc;
                aModelOrder.push(oOrder);
            };
        };
        $scope.aOrders = aModelOrder;
    });
}]);
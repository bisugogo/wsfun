'use strict';

angular.module('ntApp.createOrder', ['ui.router', 'designServices'])
.controller('CreateOrderCtrl', ['$scope', '$stateParams', '$state', 'Design', function($scope, $stateParams, $state, Design) {
    $scope.constant = {
        GENDERS: ['男', '女'],
        SIZES: ['XL', 'L', 'M', 'S']
    };
    $scope.designInfo = {};

    $scope.designInfo.designId = $stateParams.designId;

    var oDesign = Design.DesignManager.query({action: "getMyDesignById", designId: $scope.designInfo.designId}, function () {
        $scope.designInfo = oDesign.designDetail;
        $scope.designInfo.designId = $scope.designInfo._id;
    });

    $scope.orderInfo = {
        sQuantity: '1',
        sSize: 'L',
        sGender: 'male',
        sCreatorId: 'MATT'
    };

    $scope.onGenderOptionClicked = function(sGender) {
        if (sGender === '男') {
            $scope.orderInfo.sGender = 'male';
        } else {
            $scope.orderInfo.sGender = 'female';
        }
    };

    $scope.onSizeOptionClicked = function(sSize) {
        $scope.orderInfo.sSize = sSize;
    };

    $scope.onConfirmBtnClicked = function() {
        var oNewOrder = {
            designId: $scope.designInfo.designId,
            creatorId: $scope.orderInfo.sCreatorId,
            malePrice: 128,
            femalePrice: 128,
            kidPrice: 128,
            kidSize: JSON.stringify([]),
            kidQuantity: JSON.stringify([]),
        };

        if ($scope.orderInfo.sGender === 'male') {
            oNewOrder.maleSize = JSON.stringify([$scope.orderInfo.sSize]);
            oNewOrder.maleQuantity = parseInt($scope.orderInfo.sQuantity);
            oNewOrder.femaleSize = JSON.stringify([]);
            oNewOrder.femaleQuantity = JSON.stringify([]);

            oNewOrder.totalQuantity = parseInt($scope.orderInfo.sQuantity);
            oNewOrder.totalPrice = oNewOrder.malePrice * oNewOrder.maleQuantity;
        } else {
            oNewOrder.femaleSize = JSON.stringify([$scope.orderInfo.sSize]);
            oNewOrder.femaleQuantity = parseInt($scope.orderInfo.sQuantity);
            oNewOrder.maleSize = JSON.stringify([]);
            oNewOrder.maleQuantity = JSON.stringify([]);

            oNewOrder.totalQuantity = parseInt($scope.orderInfo.sQuantity);
            oNewOrder.totalPrice = oNewOrder.femalePrice * oNewOrder.femaleQuantity;
        }
        var oParam = {
            action: 'createOrder',
            data: oNewOrder
        };
        Design.DesignManager.create(oParam);
    };
}]);
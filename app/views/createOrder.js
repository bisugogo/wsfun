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
        sGender: 'male'
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
        var oNewDesign = {
            designId: $scope.designInfo.designId,
            malePrice: 128,
            femalePrice: 128,
            kidPrice: 128,
            kidSize: JSON.stringify([]),
            kidQuantity: JSON.stringify([]),
        };

        if ($scope.orderInfo.sGender === 'male') {
            oNewDesign.maleSize = JSON.stringify([$scope.orderInfo.sSize]);
            oNewDesign.maleQuantity = parseInt($scope.orderInfo.sQuantity);
            oNewDesign.femaleSize = JSON.stringify([]);
            oNewDesign.femaleQuantity = JSON.stringify([]);

            oNewDesign.totalQuantity = parseInt($scope.orderInfo.sQuantity);
            oNewDesign.totalPrice = oNewDesign.malePrice * oNewDesign.maleQuantity;
        } else {
            oNewDesign.femaleSize = JSON.stringify([$scope.orderInfo.sSize]);
            oNewDesign.femaleQuantity = parseInt($scope.orderInfo.sQuantity);
            oNewDesign.maleSize = JSON.stringify([]);
            oNewDesign.maleQuantity = JSON.stringify([]);

            oNewDesign.totalQuantity = parseInt($scope.orderInfo.sQuantity);
            oNewDesign.totalPrice = oNewDesign.femalePrice * oNewDesign.femaleQuantity;
        }
        var oParam = {
            action: 'createOrder',
            data: oNewDesign
        };
        Design.DesignManager.create(oParam);
    };
}]);
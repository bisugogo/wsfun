'use strict';

var oActivities = angular.module('ntApp.activities', ['ui.router', 'designServices']);

oActivities.config(['$stateProvider', '$httpProvider', function($stateProvider, $httpProvider) {

}]);

oActivities.controller('ActivitiesControl', ['$scope', '$stateParams', '$state', 'Design', function($scope, $stateParams, $state, Design) {
    $scope.height = window.innerHeight;
    $scope.currentUserId = '553cb49b8fb6ac1c2d3d11bd';

    var oGetCouponSourceParam = {
        action: 'getCouponSources',
    };
    Design.DesignManager.query(oGetCouponSourceParam, function(oData) {
        $scope.aCouponSources = oData.data;
    });

    $scope.onGetCouponClicked = function(oCouponSource) {
        var oTimeTo = oCouponSource.validTo;
        // oTimeTo.setYear(2015);
        // oTimeTo.setMonth(11);
        // oTimeTo.setDate(31);

        var oTimeFrom = oCouponSource.validFrom
        // oTimeFrom.setYear(2015);
        // oTimeFrom.setMonth(4);
        // oTimeFrom.setDate(30);

        var oNewCoupon = {
            userId: $scope.currentUserId,
            couponNumber: oCouponSource.couponNumber,
            status: 'new',
            couponValue: oCouponSource.couponValue,
            scope: oCouponSource.scope,
            validFrom: oTimeFrom,
            validTo: oTimeTo
        };
        var oParam = {
            action: 'createCoupon',
            data: oNewCoupon
        };

        Design.DesignManager.create(oParam, function(oDesign) {
            var i = 0;
            //$scope.hideBusy();

            //GO TO SAVE PAGE
            // $scope.updateDesignToolRow('saveDetailView');
            // $state.go('createDesign.createDetail.saveDetail');
            //$scope.designInfo.bSaved = true;
        });
    };

    $scope.onCreateNewCouponSource = function() {
        var oTimeTo = new Date('01/01/1999');
        oTimeTo.setYear(2015);
        oTimeTo.setMonth(11);
        oTimeTo.setDate(31);

        var oTimeFrom = new Date('01/01/1999');
        oTimeFrom.setYear(2015);
        oTimeFrom.setMonth(4);
        oTimeFrom.setDate(30);

        var oNewSourceJson = {
            couponNumber: 2,
            couponValue: 10,
            scope: 'unlimited',
            imgSrc: 'img/couponSource_2.png',
            validFrom: oTimeFrom,
            validTo: oTimeTo
        };
        var oParam = {
            action: 'createCouponSource',
            data: oNewSourceJson
        };

        Design.DesignManager.create(oParam, function(oDesign) {
            var i = 0;
            //$scope.hideBusy();

            //GO TO SAVE PAGE
            // $scope.updateDesignToolRow('saveDetailView');
            // $state.go('createDesign.createDetail.saveDetail');
            //$scope.designInfo.bSaved = true;
        });
    };
}]);
'use strict';

/*var oCreateDesign = angular.module('ntApp.createDesign', ['ngRoute', 'designServices']);

oCreateDesign.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/createDesign', {
        templateUrl: 'views/createDesign.html',
        controller: 'CreateDesignCtrl'
    });
}]);

oCreateDesign.controller('CreateDesignCtrl', ['$scope', '$routeParams', 'Design', function($scope, $routeParams, Design) {
    $scope.bPrivateDesign = false;
    $scope.defultDesc = new Date().toUTCString();
    $scope.createDesign = function (bPrivateDesign) {
        var oNewDesign = {
            color: "white",
            model: "Wave2015",
            price: 100,
            size: 42,
            style: "Casual"
        };
        Design.create(oNewDesign);
    };
}]);*/


var oCreateDesign = angular.module('ntApp.createDesign', ['ui.router', 'designServices']);

oCreateDesign.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('createDesign.createDetail', {
        url: '/createDetail',
        // templateUrl: 'views/createDetail.html',
        // controller: 'CreateDetailCtrl'
        views: {
            'createDetail' : {
                templateUrl: 'views/createDetail.html',
                controller: function($scope, $state, Design) {
                    $scope.createDetailtest = "this is test string in createDetail.";
                }
            }
        }
    }).state('createDesign.createDetail.saveDetail', {
        url: '/saveDetail',
        // templateUrl: 'views/createDetail.html',
        // controller: 'CreateDetailCtrl'
        views: {
            'saveDetail' : {
                templateUrl: 'views/saveDetail.html',
                controller: function($scope, $state, Design) {
                    $scope.saveDetailtest = "this is test string in saveDetail.";
                }
            }
        }
    });
}]);

oCreateDesign.controller('CreateDesignCtrl', ['$scope', '$state', 'Design', function($scope, $state, Design) {
    $scope.constant = {
        SIZE_ARRAY: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        BK_COLOR_ARRYA: ['黑', '白']
    };
    $scope.designInfo = {
        sCreatorId: 'MATT',
        bPrivateDesign: true,
        sDefaultDesc: new Date().toUTCString(),
        sBackgroundColor: '白',
        sSize: 'XL'
    };

    // $scope.bPrivateDesign = false;
    // $scope.defultDesc = new Date().toUTCString();
    $scope.createDesign = function () {
        var oNewDesign = {
            creatorId: $scope.designInfo.sCreatorId,
            color: $scope.designInfo.sBackgroundColor === '白' ? 'white' : 'black',
            model: "Wave2015",
            price: 100,
            size: $scope.designInfo.sSize,
            style: "Casual",
            desc: $scope.designInfo.sDefaultDesc,
            access: $scope.designInfo.bPrivateDesign ? 'private' : 'public'
        };
        var oParam = {
            action: 'createDesign',
            data: oNewDesign
        };
        Design.DesignManager.create(oParam);

        //GO TO SAVE PAGE
        $state.go('createDesign.createDetail.saveDetail');
    };

    $scope.deleteDesign = function (sId) {
        var oDesign = {
            designId: sId
        };
        var oParam = {
            action: 'deleteDesign',
            data: oDesign
        };
        Design.DesignManager.delete(oParam);
    };

    $scope.changeBackgroundColor = function(sColor) {
        $scope.designInfo.sBackgroundColor = sColor;
    };

    $scope.changeSize = function(sSize) {
        $scope.designInfo.sSize = sSize;
    };

    $scope.onGenderSelected = function() {
        $state.go("createDesign.createDetail");
    };

    $scope.onCreateDesignBackClicked = function() {
        $state.go('^');
    };
}]);
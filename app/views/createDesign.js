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

//oCreateDesign.config(['$stateProvider', function($stateProvider) {
    // $stateProvider.state('createDesign', {
    //     url: '/createDesign',
    //     templateUrl: 'views/createDesign.html',
    //     controller: 'CreateDesignCtrl'
    // });
//}]);

//oCreateDesign.controller('CreateDesignCtrl', ['$scope', 'Design', function($scope, Design) {
    /*$scope.status = {
        isopen: false
    };
    $scope.designInfo = {
        bPrivateDesign: false,
        sDefaultDesc: new Date().toUTCString(),
        sBackgroundColor: 'white'
    };

    // $scope.bPrivateDesign = false;
    // $scope.defultDesc = new Date().toUTCString();
    $scope.createDesign = function (bPrivateDesign) {
        var oNewDesign = {
            color: $scope.designInfo.sBackgroundColor === '白' ? 'white' : 'black',
            model: "Wave2015",
            price: 100,
            size: 42,
            style: "Casual",
            desc: $scope.designInfo.sDefaultDesc,
            access: $scope.designInfo.bPrivateDesign ? 'private' : 'public'
        };
        Design.create(oNewDesign);
    };*/
//}]);


// oCreateDesign.controller('AlertDemoCtrl', function ($scope) {
//   $scope.alerts = [
//     { type: 'danger', msg: 'Oh snap! Change a few things up and try submitting again.' },
//     { type: 'success', msg: 'Well done! You successfully read this important alert message.' }
//   ];

//   $scope.addAlert = function() {
//     $scope.alerts.push({msg: 'Another alert!'});
//   };

//   $scope.closeAlert = function(index) {
//     $scope.alerts.splice(index, 1);
//   };
// });
'use strict';

// Declare app level module which depends on views, and components
var ntApp = angular.module('ntApp', [
    //'ngRoute',
    'ui.router',
    'ntApp.myDesigns',
    'ntApp.designDetail',
    'ntApp.myInfo',
    'ntApp.couponList',
    'ntApp.createDesign',
    'ntApp.activities',
    'ntApp.management',
    'ui.bootstrap',
    'angularFileUpload',
    'angular-carousel',
    //'ngDragDrop',
    'angular-gestures',
    'angular-md5'
    //'ngAnimate'
]);

/*ntApp.config(['$routeProvider', function($routeProvider) {
    //ntApp.registerCtrl = $controllerProvider.register;

    $routeProvider
    // .when('/myDesigns', {
    //     templateUrl: 'views/myDesigns.html',
    //     //controller: 'MyDesignsListCtrl'
    //     resolve: controller('myDesigns')
    // })
    // .when('/design/:designId', {
    //     templateUrl: 'views/designDetail.html',
    //     //controller: 'DesignDetailCtrl'
    //     resolve: controller('designDetail')
    // })
    .otherwise({
        redirectTo: '/myDesigns'
    });
}]);*/

ntApp.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("myDesigns");
    //
    // Now set up the states
    $stateProvider
    .state('myInfo', {
        url: "/myInfo",
        templateUrl: 'views/myInfo.html',
        controller: 'MyInfoCtrl'
    })
    .state('couponList', {
        url: "/couponList",
        templateUrl: 'views/couponList.html',
        controller: 'CouponListCtrl'
    })
    .state('management', {
        url: "/temp/management",
        templateUrl: 'views/management.html',
        controller: 'ManagementControl'
    })
    .state('activities', {
        url: "/activities",
        templateUrl: 'views/activities.html',
        controller: 'ActivitiesControl'
    })
    .state('orderListAuth', {
        url: '/orderListAuth',
        template: '<div></div>',
        controller: function($window, $location) {
            if (!sTempCode) {
                $window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + 
                'wxf26855bd0cda23bd' + '&redirect_uri=' + 
                encodeURIComponent('http://design.weavesfun.com/#/orderList') + 
                '&response_type=code&scope=snsapi_base&state=mine#wechat_redirect';
            }
        }
    });
});

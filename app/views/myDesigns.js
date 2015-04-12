'use strict';

/*var myDesignList = angular.module('ntApp.myDesigns', ['ngRoute', 'ntApp.createDesign', 'designServices']);

myDesignList.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/myDesigns', {
        templateUrl: 'views/myDesigns.html',
        controller: 'MyDesignsListCtrl'
    }).when('/createDesign', {
        templateUrl: 'views/createDesign.html',
        controller: 'CreateDesignCtrl'
    });
}])

myDesignList.controller('MyDesignsListCtrl', ['$scope', 'Design', function($scope, Design) {
    var aDesigns = Design.query(function () {
        var newWidth = 600 + aDesigns.length + 1;
        for (var i = 0; i < aDesigns.length; i++) {
            aDesigns[i].image = 'http://placekitten.com/' + newWidth + '/300';
        }
        $scope.myDesigns = aDesigns;
    });
}]);

myDesignList.controller('CreateDesignCtrl', [function() {

}]);*/

var myDesignList = angular.module('ntApp.myDesigns', [
    'ui.router', 
    'ntApp.createDesign', 
    'ntApp.orderDesign', 
    'ntApp.designDetail', 
    'ntApp.orderList',
    'ntApp.payOrder',
    'designServices',
    'wechatServices'
]);

var sTempCode = null;

myDesignList.config(['$stateProvider', '$httpProvider', function($stateProvider, $httpProvider) {
    $stateProvider.state('myDesigns', {
        url: '/myDesigns',
        templateUrl: 'views/myDesigns.html',
        controller: 'MyDesignsListCtrl'
    })
    .state('myDesignsAuth', {
        url: '/myDesignsAuth',
        template: '<div>Authenticating...</div>',
        controller: function($window) {
            if (!sTempCode) {
                $window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + 
                'wxf26855bd0cda23bd' + '&redirect_uri=' + 
                encodeURIComponent('http://design.weavesfun.com/#/myDesigns') + 
                '&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';
            }
        }
    })
    .state('createDesign', {
        url: '/createDesign',
        templateUrl: 'views/createDesign.html',
        controller: 'CreateDesignCtrl'
    })
    .state('payOrder', {
        url: '/payOrder',
        templateUrl: 'views/payOrder.html',
        controller: 'PayOrderCtrl'
    })
    .state('designDetail', {
        url: '/designDetail/:designId',
        templateUrl: 'views/designDetail.html',
        controller: 'DesignDetailCtrl'
    }).state('orderList', {
        url: '/orderList',
        templateUrl: 'views/orderList.html',
        controller: 'OrderListCtrl'
    });

    // $httpProvider.defaults.useXDomain = true;
    // delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

myDesignList.controller('MyDesignsListCtrl', ['$scope', '$location', '$stateParams', '$state', '$http', 'Design', 'Auth', 
    function($scope, $location, $stateParams, $state, $http, Design, Auth) {
        var sCode = $location.$$search.code;
        $scope.code = sCode;
        sTempCode = sCode;

        //$http.defaults.useXDomain = true;
        //delete $http.defaults.headers.common['X-Requested-With'];
        var oUserReqParam = {
            action: 'getWechatUserOpenId',
            code: sCode
        };
        var oUser = Auth.AuthManager.query(oUserReqParam, function () {
            if (oUser.openid) {
                $scope.code = "User OpenID: " + oUser.openid;
            } else if (oUser.errmsg) {
                $scope.code = oUser.errmsg;
            } else {
                $scope.code = "nothing!!!!";
            }
        });

        // $http.get("https://api.weixin.qq.com/sns/oauth2/access_token", {
        //     appid: "wxf26855bd0cda23bd",
        //     secret: "498e6f493c29733d46e212c441f505e8",
        //     code: "asdfasdf",
        //     grant_type: "authorization_code"
        // }).success(function(result) {
        //     console.log("Success", result);
        //     $scope.result = result;
        // }).error(function() {
        //     console.log("error");
        // });

        $scope.constant = {
            DESIGN_ITEM_OPT: ['删除', '更改'],
        };

        //Design.setGetParam({action: 'getAllMyDesigns'});
        var oResult = Design.DesignManager.query({action: 'getMyDesigns', userId: 'MATT'}, function () {
            // var newWidth = 600 + oResult.designList.length + 1;
            // for (var i = 0; i < oResult.designList.length; i++) {
            //     oResult.designList[i].image = 'http://placekitten.com/' + newWidth + '/300';
            // }
            //$scope.aMyDesigns = oResult.designList;
            $scope.aMyDesigns = [{},{}];
        });

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

        $scope.onDesignItemOptionClicked = function(sOption, oDesign) {
            if (sOption === '删除') {
                $scope.deleteDesign(oDesign._id);
            } else if (sOption === '更改') {

            } else {

            }
        };

        $scope.onDesignItemClicked = function(oDesign) {
            $state.go('designDetail', {designId: oDesign._id});
        };
}]);

/*myDesignList.controller('CreateDesignCtrl', ['$scope', '$state', 'Design', function($scope, $state, Design) {
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

        //GO TO ORDER PAGE
        //$state.go('orderDesign');
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
}]);*/

myDesignList.controller('OrderDesignCtrl', ['$scope', 'Design', function($scope, Design) {
    
}]);
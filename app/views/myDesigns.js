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
    'ntApp.payWechatOrder',
    'designServices',
    'wechatServices'
]);

var sTempCode = null;

myDesignList.config(['$stateProvider', '$httpProvider', function($stateProvider, $httpProvider) {
    $stateProvider.state('myDesigns', {
        url: '/myDesigns?state',
        templateUrl: 'views/myDesigns.html',
        controller: 'MyDesignsListCtrl'
    })
    .state('myDesignsAuth', {
        url: '/myDesignsAuth',
        template: '<div></div>',
        controller: function($window, $location) {
            if (!sTempCode) {
                var sState = '';
                //alert($location.$$search.type);
                if ($location.$$search.type === 'all') {
                    sState = 'all';
                } else if ($location.$$search.type === 'mine') {
                    sState = 'mine';
                }
                $window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + 
                'wxf26855bd0cda23bd' + '&redirect_uri=' + 
                encodeURIComponent('http://design.weavesfun.com/#/myDesigns') + 
                '&response_type=code&scope=snsapi_base&state=' + sState + '#wechat_redirect';
            }
        }
    })
    .state('designItemAuth', {
        url: '/designItemAuth',
        templateUrl: 'views/designItemAuth.html',
        controller: function($window, $scope, $state, Design, Auth, UIData) {
            var oAppData = UIData.getAppData();
            $scope.authLink = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + 
                oAppData.APP_ID + '&redirect_uri=' + 
                encodeURIComponent('http://design.weavesfun.com/#/myDesigns') + 
                '&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';
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
    .state('payWechatOrder', {
        url: '/pay/payWechatOrder?showwxpaytitle',
        templateUrl: 'views/payWechatOrder.html',
        controller: 'PayWechatOrderCtrl'
    })
    .state('myDesigns.designDetail', {
        url: '/designDetail/:designId?showwxpaytitle',
        views: {
            'designDetail' : {
                templateUrl: 'views/designDetail.html',
                resolve: {
                    PreviousState: [
                        "$state", "$location",
                        function ($state, $location) {
                            var currentStateData = {
                                name: $state.current.name,
                                params: $state.params,
                                url: $state.href($state.current.name, $state.params),
                                urlParams: {
                                    state: $location.$$search.state
                                }
                            };
                            return currentStateData;
                        }
                    ]
                },
                controller: function($scope, $location, $stateParams, $state, Design, Auth, UIData, PreviousState) {
                    if ($state.current.name === 'myDesigns.designDetail') {
                        var sDesignId = $stateParams.designId;
                        var oResult = Design.DesignManager.query({action: 'getDesignById', designId: sDesignId}, function (oData) {
                            if (!oData.error) {
                                //$scope.oCurrentDesign = oData.data;
                                var oDesign = oData.data;

                                if (oDesign.gender === 'male') {
                                    if (oDesign.color === 'white') {
                                        oDesign.bkImg = 'img/male_white.png';
                                    } else {
                                        oDesign.bkImg = 'img/male_black.png';
                                    }
                                } else {
                                    if (oDesign.color === 'white') {
                                        oDesign.bkImg = 'img/female_white.png';
                                    } else {
                                        oDesign.bkImg = 'img/female_black.png';
                                    }
                                }

                                if (oDesign.access !== 'private') {
                                    var oCenterDom = $('.designDetailViewContent')[0];
                                    if (oCenterDom) {
                                        var iWidth = oCenterDom.clientWidth;
                                        var iHeight = iWidth * 1021 / 642;
                                        var iLeft = iWidth * 0.21;
                                        var iTop = iHeight * 0.22;
                                        var iDesignImageWidth = iWidth * 0.6;

                                        oDesign.positionInfoStyleValue = "left:" + iLeft + "px;" + 
                                            "top:" + iTop + "px;" + 
                                            "width:" + iDesignImageWidth + "px;";
                                    }
                                } else {
                                    oDesign.positionInfoStyleValue = "display:none;";
                                }

                                $scope.setCurrentDesign(oDesign);
                                $scope.showCurrentDesignInfo(false);

                                var sCode = $location.$$search.code;
                                if (sCode) {
                                    //alert(sCode);
                                    //Come from OAUTH redirect
                                    var oUserReqParam = {
                                        action: 'getWechatUserOpenId',
                                        code: sCode
                                    };
                                    Auth.AuthManager.query(oUserReqParam, function (oData) {
                                        if (!oData.error) {
                                            var oUserInfo = oData.data;
                                            var oResUserInfo = {
                                                userId: oUserInfo._id,
                                                wechatId: oUserInfo.wechatId,
                                                type: oUserInfo.type
                                            };
                                            UIData.setData('userInfo', oResUserInfo);
                                            //$scope.userInfo = oResUserInfo;
                                            UIData.setData('currentDesign', $scope.oCurrentDesign);
                                            $state.go('createDesign.createDetail.orderDesign');
                                        } else {
                                            alert(oData.error);
                                        }
                                    });
                                }
                            }
                            // $scope.aMyDesigns = aDesigns.designList;
                            // var oCenterDom = $('.myDesignListCenter')[0];
                            // if (oCenterDom) {
                            //     var iWidth = oCenterDom.clientWidth;
                            //     var iHeight = iWidth * 1021 / 642;
                            //     var iLeft = iWidth * 0.21;
                            //     var iTop = iHeight * 0.3;
                            //     var iDesignImageWidth = iWidth * 0.6;

                            //     $scope.positionInfoStyleValue = "left:" + iLeft + "px;" + 
                            //         "top:" + iTop + "px;" + 
                            //         "width:" + iDesignImageWidth + "px;";
                            // }
                        });
                    }


                    $scope.designId = $stateParams.designId;

                    $scope.onBackFromDesignDetailClicked = function() {
                        if (PreviousState.urlParams.state === 'mine') {
                            $state.go('myDesigns', {state : 'mine'});
                        } else {
                            $state.go('myDesigns', {state : 'all'});
                        }
                        
                    };
                    
                }
            }
        }
    }).state('orderList', {
        url: '/orderList',
        templateUrl: 'views/orderList.html',
        controller: 'OrderListCtrl'
    });

    // $httpProvider.defaults.useXDomain = true;
    // delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

myDesignList.controller('MyDesignsListCtrl', ['$window', '$scope', '$location', '$stateParams', '$state', '$http', 'Design', 'Auth', 'UIData',
    function($window, $scope, $location, $stateParams, $state, $http, Design, Auth, UIData) {
        //var oUserInfo = UIData.getData('userInfo');
        $scope.test = {
            larry: {
                openId: 'oMOsBtzA2Kbns3Dulc2s6upB5ZBw',
                _id: '553cb49b8fb6ac1c2d3d11bd'
            }
        };

        var oAppData = UIData.getAppData();

        var sCode = $location.$$search.code;
        var sListParam = $location.$$search.state;
        $scope.urlStateValue = sListParam;
        //$scope.aMyDesigns = [];

        //alert(sCode);

        // if (!sCode && !oAppData.TESTING) {
        //     $window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + 
        //         oAppData.APP_ID + '&redirect_uri=' + 
        //         encodeURIComponent('http://design.weavesfun.com/#/myDesigns') + 
        //         '&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';
        //     return;
        // }

        $scope.code = sCode;
        sTempCode = sCode;

        if ($state.current.name === 'myDesigns') {
            if (sCode || oAppData.TESTING) {
                var oUserReqParam = {};

                if (oAppData.TESTING) {
                    $scope.hostName = 'http://localhost:10001';
                    oUserReqParam = {
                        action: 'getTestUserOpenId',
                        userId: $scope.test.larry._id
                    };
                } else {
                    $scope.hostName = 'http://www.weavesfun.com';
                    oUserReqParam = {
                        action: 'getWechatUserOpenId',
                        code: sCode
                    };
                }
                
                var bUserQuerySent = UIData.getQuerySentData('userInfo');
                if (!bUserQuerySent) {
                    //Prevent sending request the second time
                    UIData.setQuerySentData('userInfo', true);
                    Auth.AuthManager.query(oUserReqParam, function (oData) {
                        var oResUserInfo = oData.data;
                        oResUserInfo.userId = oResUserInfo._id;
                        UIData.setData('userInfo', oResUserInfo);
                        $scope.userInfo = oResUserInfo;

                        var oMineParam = {};
                        if (sListParam === 'mine') {
                            oMineParam = {
                                action: 'getMyDesigns',
                                userId: oResUserInfo.userId,
                                offset: 0,
                                size: oAppData.LAZY_LOAD_SIZE
                            };
                            var oResult = Design.DesignManager.query(oMineParam, function (oData) {
                                $scope.handleDesignListCallback(oData);

                                $scope.lazyLoadInterval = setInterval(function() {
                                    var iCurrentSize = $scope.aMyDesigns.length;
                                    if (iCurrentSize === $scope.iTotalDesignCount) {
                                        clearInterval($scope.lazyLoadInterval);
                                        return;
                                    } else {
                                        var iNextOffset = iCurrentSize;
                                        var oParam = {
                                            action: 'getMyDesigns',
                                            userId: oResUserInfo.userId,
                                            offset: iNextOffset,
                                            size: oAppData.LAZY_LOAD_SIZE
                                        };
                                        var oResult = Design.DesignManager.query(oParam, function (oData) {
                                            $scope.handleDesignListCallback(oData);
                                        });
                                    }
                                }, 3000);
                            });
                        }
                    });
                }
                

                if (sListParam !== 'mine') {
                    var bDesignListQuerySent = UIData.getQuerySentData('designList');
                    if (!bDesignListQuerySent) {
                        //Prevent sending request the second time
                        UIData.setQuerySentData('designList', true);
                        var oParam = {
                            action: 'getDesigns',
                            offset: 0,
                            size: oAppData.LAZY_LOAD_SIZE
                        };
                        var oResult = Design.DesignManager.query(oParam, function (oData) {
                            $scope.iDesignCarouselIndex = 0;
                            $scope.handleDesignListCallback(oData);

                            $scope.lazyLoadInterval = setInterval(function() {
                                var iCurrentSize = $scope.aMyDesigns.length;
                                if (iCurrentSize === $scope.iTotalDesignCount) {
                                    clearInterval($scope.lazyLoadInterval);
                                    return;
                                } else {
                                    var iNextOffset = iCurrentSize;
                                    var oParam = {
                                        action: 'getDesigns',
                                        offset: iNextOffset,
                                        size: oAppData.LAZY_LOAD_SIZE
                                    };
                                    var oResult = Design.DesignManager.query(oParam, function (oData) {
                                        $scope.handleDesignListCallback(oData);
                                    });
                                }
                            }, 3000);
                        });
                    }
                }
            }
        }

        $scope.handleDesignListCallback = function(oData) {
            //$scope.aMyDesigns = oData.designList;
            $scope.iTotalDesignCount = oData.totalSize;

            for (var i = 0; i < oData.designList.length; i++) {
                var oCurItem = oData.designList[i];
                if (!$scope.aMyDesigns) {
                    $scope.aMyDesigns = [];
                }
                $scope.aMyDesigns.push(oCurItem);

                if (oCurItem.gender === 'male') {
                    if (oCurItem.color === 'white') {
                        oCurItem.bkImg = 'img/male_white.png';
                    } else {
                        oCurItem.bkImg = 'img/male_black.png';
                    }
                } else {
                    if (oCurItem.color === 'white') {
                        oCurItem.bkImg = 'img/female_white.png';
                    } else {
                        oCurItem.bkImg = 'img/female_black.png';
                    }
                }
            }

            var oCenterDom = $('.myDesignListCenter')[0];
            if (oCenterDom) {
                var iWidth = oCenterDom.clientWidth;
                var iHeight = iWidth * 1021 / 642;
                var iLeft = iWidth * 0.21;
                var iTop = iHeight * 0.22;
                var iDesignImageWidth = iWidth * 0.6;

                $scope.positionInfoStyleValue = "left:" + iLeft + "px;" + 
                    "top:" + iTop + "px;" + 
                    "width:" + iDesignImageWidth + "px;";
            }
        };

        
        

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

        $scope.whatILiked = false;
        $scope.oCurrentDesign = {};

        $scope.setCurrentDesign = function(oDesign) {
            $scope.oCurrentDesign = oDesign;
        };

        $scope.showCurrentDesignInfo = function(bShow) {
            if (!bShow) {
                if (!!$scope.oCurrentDesign) {
                    $scope.oCurrentDesign.bShowInfo = false;
                }
            } else {
                if (!!$scope.oCurrentDesign) {
                    $scope.oCurrentDesign.bShowInfo = true;
                }
            }
        };

        $scope.onCurrentDesignClicked = function() {
            if (!!$scope.oCurrentDesign) {
                if ($scope.oCurrentDesign.bShowInfo) {
                    $scope.showCurrentDesignInfo(false);
                } else {
                    $scope.showCurrentDesignInfo(true);
                }
            }
        };

        $scope.onILikedClicked = function() {
            $scope.whatILiked = true;
        };
        $scope.onIDesignedClicked = function() {
            $scope.whatILiked = false;
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

        $scope.onDesignItemOptionClicked = function(sOption, oDesign) {
            if (sOption === '删除') {
                $scope.deleteDesign(oDesign._id);
            } else if (sOption === '更改') {

            } else {

            }
        };

        $scope.onDesignItemClicked = function(oDesign) {
            $scope.oCurrentDesign = oDesign;
            $state.go('myDesigns.designDetail', {designId: oDesign._id, showwxpaytitle: 1});
        };

        $scope.onOrderBtnClicked = function() {
            var oUserInfo = UIData.getData('userInfo');
            var oAppData = UIData.getAppData();
            if (!oUserInfo) {
                $window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + 
                    oAppData.APP_ID + '&redirect_uri=' + 
                    encodeURIComponent('http://design.weavesfun.com/#/myDesigns/designDetail/' + $scope.oCurrentDesign._id) + 
                    '&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';
                return;
            }
            // if (!sCode && !oAppData.TESTING) {
            //     $window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + 
            //         oAppData.APP_ID + '&redirect_uri=' + 
            //         encodeURIComponent('http://design.weavesfun.com/#/myDesigns') + 
            //         '&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';
            //     return;
            // }

            UIData.setData('currentDesign', $scope.oCurrentDesign);
            $state.go('createDesign.createDetail.orderDesign');
            //$state.go('payWechatOrder');
        };

        $scope.onCreateDesignBtnClicked = function() {
            var oUserInfo = UIData.getData('userInfo');
            var oAppData = UIData.getAppData();
            if (!oUserInfo) {
                $window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + 
                    oAppData.APP_ID + '&redirect_uri=' + 
                    encodeURIComponent('http://design.weavesfun.com/#/createDesignAuth') + 
                    '&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';
                return;
            }
            $state.go('createDesign');
        };
}]);
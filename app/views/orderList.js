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

orderList.controller('OrderListCtrl', ['$scope', '$location', '$state', 'Design', 'Auth', 'UIData', 
    function($scope, $location, $state, Design, Auth, UIData) {
        $scope.test = {
            larry: {
                openId: 'oMOsBtzA2Kbns3Dulc2s6upB5ZBw',
                _id: '553cb49b8fb6ac1c2d3d11bd'
            }
        };

        var oAppData = UIData.getAppData();

        var sCode = $location.$$search.code;
        var sListParam = $location.$$search.state;

        $scope.code = sCode;
        sTempCode = sCode;

        if (sCode || oAppData.TESTING) {
            var oUserReqParam = {};

            if (oAppData.TESTING) {
                oUserReqParam = {
                    action: 'getTestUserOpenId',
                    userId: $scope.test.larry._id
                };
            } else {
                oUserReqParam = {
                    action: 'getWechatUserOpenId',
                    code: sCode
                };
            }
            
            var bOrderListQuerySent = UIData.getQuerySentData('orderList');
            if (!bOrderListQuerySent) {
                //Prevent sending request the second time
                UIData.setQuerySentData('orderList', true);
                Auth.AuthManager.query(oUserReqParam, function (oData) {
                    var oResUserInfo = oData.data;
                    oResUserInfo.userId = oResUserInfo._id;
                    UIData.setData('userInfo', oResUserInfo);
                    $scope.userInfo = oResUserInfo;

                    var oMineParam = {
                        action: 'getMyOrders',
                        userId: oResUserInfo.userId
                    };
                    var oResult = Design.DesignManager.query(oMineParam, function (oData) {
                        $scope.handleOrderListCallback(oData);
                    });
                });
            }
        }

        $scope.handleOrderListCallback = function(oData) {
            if (oData.error) {
                alert(oData.error);
            } else {
                var ORDER_PER_PAGE = 3;
                $scope.aOrderGroups = [];

                var aOrders = oData.data;
                if (aOrders.length > 0) {
                    for (var i = 0; i < aOrders.length; i++) {
                        var oCurOrder = aOrders[i];
                        $scope.setDesignBKImageURL(oCurOrder);
                        $scope.setOrderUITitle(oCurOrder);
                        $scope.setOrderButtonText(oCurOrder);
                        $scope.setPreviewPosition(oCurOrder);


                        if (i % ORDER_PER_PAGE === 0) {
                            var oNewGroup = [];
                            oNewGroup.push(oCurOrder);
                            $scope.aOrderGroups.push(oNewGroup);
                        } else {
                            var iLastGroupIdx = $scope.aOrderGroups.length - 1;
                            var aLastGroup = $scope.aOrderGroups[iLastGroupIdx];
                            aLastGroup.push(oCurOrder);
                        }
                    }
                }
            }
        };

        $scope.setDesignBKImageURL = function(oOrder) {
            if (oOrder.designId.gender === 'male') {
                if (oOrder.designId.color === 'white') {
                    oOrder.designId.bkImg = 'img/male_white.png';
                } else {
                    oOrder.designId.bkImg = 'img/male_black.png';
                }
            } else {
                if (oOrder.designId.color === 'white') {
                    oOrder.designId.bkImg = 'img/female_white.png';
                } else {
                    oOrder.designId.bkImg = 'img/female_black.png';
                }
            }
        };

        $scope.setOrderUITitle = function(oOrder) {
            var sRet = '';
            var iMaleCount = parseInt(oOrder.maleQuantity);
            var iFemaleCount = parseInt(oOrder.femaleQuantity);
            if (iMaleCount > 0) {
                sRet += '男士';
                oOrder.uiQuantity = iMaleCount;
                oOrder.uiSize = oOrder.maleSize;
            } else {
                sRet += '女士';
                oOrder.uiQuantity = iFemaleCount;
                oOrder.uiSize = oOrder.femaleSize;
            }

            if (oOrder.designId.color === 'white') {
                sRet += '白色';
            } else {
                sRet += '黑色';
            }

            sRet += '短袖体恤';
            oOrder.uiTitle = sRet;
            return sRet;
        };

        $scope.setOrderButtonText = function(oOrder) {
            if (oOrder.status === '待付款') {
                oOrder.buttonText = '国库拨款';
                oOrder.tip = '尚未付款';
            } else {
                oOrder.buttonText = '再次购买';
                if (oOrder.status === '待发货') {
                    oOrder.tip = '赶制中';
                } else if (oOrder.status === '已发货') {
                    oOrder.tip = '已经发货';
                } else {
                    oOrder.tip = '交易完成';
                }
            }
            
        };

        $scope.setPreviewPosition = function(oOrder) {
            var oCenterDom = $('.myOrdersListContent')[0];
            if (oCenterDom) {
                var iWidth = (oCenterDom.clientWidth - 10) * 0.25 - 5;
                var iHeight = iWidth * 1021 / 642;
                var iLeft = iWidth * 0.21;
                var iTop = iHeight * 0.3;
                var iDesignImageWidth = iWidth * 0.6;

                oOrder.previewPosition = "left:" + iLeft + "px;" + 
                    "top:" + iTop + "px;" + 
                    "width:" + iDesignImageWidth + "px;";
            }
        };

        $scope.onButtonClicked = function(oOrder) {
            if (oOrder.status === '待付款') {
                var oOrderInfo = {
                    orderId: oOrder._id,
                    totalPay: oOrder.totalPrice,
                    usedCoupons: [],
                    creatorId: oOrder.creatorId,
                    clothesGender: oOrder.designId.gender
                };
                UIData.setData('orderInfo', oOrderInfo);
                UIData.setData('designInfo', oOrder.designId);
                $state.go('payWechatOrder', {showwxpaytitle : 1});
            } else {
                var sDesignId = oOrder.designId._id;
                $state.go('myDesigns.designDetail', {designId: sDesignId, showwxpaytitle: 1});
            }
        };
    }
]);
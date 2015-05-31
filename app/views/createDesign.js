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


var oCreateDesign = angular.module('ntApp.createDesign', ['ui.router', 'designServices', 'angular-gestures', 'uiDataServices']);

oCreateDesign.config(['$stateProvider', 'hammerDefaultOptsProvider', function($stateProvider, hammerDefaultOptsProvider) {
    $stateProvider.state('createDesign.createDetail', {
        url: '/createDetail',
        // templateUrl: 'views/createDetail.html',
        // controller: 'CreateDetailCtrl'
        views: {
            'createDetail' : {
                templateUrl: 'views/createDetail.html',
                controller: function($scope, $state, Design) {
                    $scope.onOpenMyGallery = function() {
                        if ($scope.$parent.sActiveFeature === 'cameraSelected') {
                            $scope.restoreActiveFeature();
                        } else {
                            $scope.getMyArtifactThumbnails();
                            $scope.$parent.sActiveFeature = 'cameraSelected';
                            $state.go('createDesign.createDetail.myGallery');
                        }
                    };

                    $scope.onOpenPublicGallery = function() {
                        if ($scope.$parent.sActiveFeature === 'highlightSelected') {
                            $scope.restoreActiveFeature();
                        } else {
                            $scope.getPublicArtifactThumbnails('hot');
                            $scope.$parent.sActiveFeature = 'highlightSelected';
                            $scope.$parent.sPublicArtifactType = 'hot';
                            $state.go('createDesign.createDetail.publicGallery');
                        }
                    };
                }
            }
        }
    })
    .state('createDesignAuth', {
        url: '/createDesignAuth',
        template: '<div></div>',
        controller: function($window) {
            if (!sTempCode) {
                setTimeout(function() {
                    $window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + 
                    'wxf26855bd0cda23bd' + '&redirect_uri=' + 
                    encodeURIComponent('http://design.weavesfun.com/#/createDesign') + 
                    '&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';
                }, 2000);
                // $window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + 
                // 'wxf26855bd0cda23bd' + '&redirect_uri=' + 
                // encodeURIComponent('http://design.weavesfun.com/#/createDesign') + 
                // '&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';
            }
        }
    })
    .state('createDesign.createDetail.myGallery', {
        views: {
            'personalGallery': {
                templateUrl: 'views/personalGallery.html',
                controller: function($scope, $state, Design) {
                    $scope.onManagePrivateArtifacts = function() {
                        $scope.$parent.isManagingArtifacts = $scope.$parent.isManagingArtifacts ? false : true;
                    };

                    $scope.onDeleteArtifact = function(oTargetArtifact) {
                        var oParam = {
                            action: 'deleteArtifact',
                            data: {
                                artifactId: oTargetArtifact._id
                            }
                        };
                        Design.FileManager.delete(oParam, function(oData) {
                            if (oData.error) {
                                $scope.$parent.aMessage.push({
                                    type: 'danger',
                                    content: oData.error || oData.data
                                });
                            } else {
                                var iDeleteGroupIdx = -1;
                                var iDeleteIdx = -1;
                                for (var i = 0; i < $scope.aMyArtifact.length; i++) {
                                    var oCurGroup = $scope.aMyArtifact[i];
                                    var bFound = false;
                                    for (var j = 0; j < oCurGroup.length; j++) {
                                        if (oCurGroup[j]._id === oTargetArtifact._id) {
                                            oCurGroup.splice(j, 1);
                                            bFound = true;
                                            break;
                                        }
                                    }
                                    if (bFound) {
                                        break;
                                    }
                                }

                                for (var k = 0; k < $scope.aSelectedArtifact.length; k++) {
                                    if ($scope.aSelectedArtifact[k]._id === oTargetArtifact._id) {
                                        $scope.aSelectedArtifact.splice(k, 1);
                                        break;
                                    }
                                }
                            }
                        });
                    };
                }
            }
        }
    })
    .state('createDesign.createDetail.publicGallery', {
        views: {
            'publicGallery': {
                templateUrl: 'views/publicGallery.html',
                controller: function($scope, $state, Design) {
                    var i = 0;
                }
            }
        }
    })
    .state('createDesign.createDetail.saveDetail', {
        url: '/saveDetail',
        // templateUrl: 'views/createDetail.html',
        // controller: 'CreateDetailCtrl'
        views: {
            'saveDetail' : {
                templateUrl: 'views/saveDetail.html',
                controller: function($scope, $state, Design) {
                    //$scope.saveDetailtest = "this is test string in saveDetail.";
                }
            }
        }
    }).state('createDesign.createDetail.orderDesign', {
        url: '/orderDesign',
        // templateUrl: 'views/createDetail.html',
        // controller: 'CreateDetailCtrl'
        views: {
            'orderDesign' : {
                templateUrl: 'views/orderDesign.html',
                resolve: {
                    PreviousState: [
                        "$state",
                        function ($state) {
                            var currentStateData = {
                                name: $state.current.name,
                                params: $state.params,
                                url: $state.href($state.current.name, $state.params)
                            };
                            return currentStateData;
                        }
                    ]
                },
                controller: function($scope, $state, Design, UIData, PreviousState) {
                    //$scope.saveDetailtest = "this is test string in saveDetail.";
                    // $scope.orderInfo = {
                    //     defaultQuanaity: 1,
                    //     defaultSize: '中',
                    //     defaultGender: $scope.designInfo.sGender,
                    //     defaultQuantityAction: '加',
                    //     totalPay: 1001,
                    //     usedCoupons: []
                    // };
                    var oTime = new Date();
                    $scope.oTimeStr = '公元' + oTime.getFullYear() + '年' + (oTime.getMonth() + 1) + '月' + oTime.getDate() + '日';

                    if (PreviousState.name === 'myDesigns.designDetail') {
                        //Come from design detail to make order
                        $scope.updateDesignToolRow(false);

                        var oDesignInfo = UIData.getData('currentDesign');
                        oDesignInfo.sGender = oDesignInfo.gender;
                        oDesignInfo.bPublicDesign = oDesignInfo.access === 'public' ? true : false;
                        oDesignInfo.sDescription = oDesignInfo.desc;
                        oDesignInfo.designId = oDesignInfo._id;
                        oDesignInfo.bSaved = true;

                        if (oDesignInfo.gender === 'male') {
                            if (oDesignInfo.color === 'white') {
                                oDesignInfo.bkImg = 'img/male_white.png';
                                oDesignInfo.previewBkImg = 'img/male_white_preview.png';
                            } else {
                                oDesignInfo.bkImg = 'img/male_black.png';
                                oDesignInfo.previewBkImg = 'img/male_black_preview.png';
                            }
                        } else {
                            if (oDesignInfo.color === 'white') {
                                oDesignInfo.bkImg = 'img/female_white.png';
                                oDesignInfo.previewBkImg = 'img/female_white_preview.png';
                            } else {
                                oDesignInfo.bkImg = 'img/female_black.png';
                                oDesignInfo.previewBkImg = 'img/female_black_preview.png';
                            }
                        }

                        $scope.setDesignInfo(oDesignInfo);


                        var orderInfo = {
                            clothesQuanaity: 1,
                            clothesSize: 'L',
                            clothesGender: $scope.designInfo.sGender,
                            defaultQuantityAction: '加',
                            totalPay: 0,
                            usedCoupons: []
                        };
                        $scope.setOrderInfo(orderInfo);
                    }

                    $scope.onIncreaseQuantity = function() {
                        $scope.orderInfo.clothesQuanaity++;
                        $scope.calcPay();
                    };

                    $scope.onDecreaseQuantity = function() {
                        if ($scope.orderInfo.clothesQuanaity > 1) {
                            $scope.orderInfo.clothesQuanaity--;
                            $scope.calcPay();
                        }
                    };

                    $scope.onSizeInfoButtonClicked = function() {
                        $scope.bShowSizeInfo = $scope.bShowSizeInfo ? false : true;
                    };

                    $scope.onCreateOrderBtnClicked = function() {
                        // var iCouponValue = 0;
                        // for (var i = 0; i < $scope.orderInfo.usedCoupons.length; i++) {
                        //     iCouponValue += $scope.orderInfo.usedCoupons[i].couponValue;
                        // };
                        // $scope.orderInfo.totalPay = $scope.constant.ORIGIN_PRICE * $scope.orderInfo.clothesQuanaity - 
                        //     iCouponValue;
                        var bValid = $scope.validateAddressInfo();
                        if (!bValid) {
                            return;
                        }

                        //var sMailInfo = $scope.getMailInfoJsonStr();

                        var oUserInfo = UIData.getData('userInfo');
                        var oParam = {
                            action: 'createOrder',
                            data: {
                                creatorId: oUserInfo.userId,
                                designId: $scope.designInfo.designId,
                                contact: $scope.orderInfo.sContact,
                                contactMobile: $scope.orderInfo.sMobile,
                                //province: $scope.orderInfo.sProvince,
                                //city: $scope.orderInfo.sCity,
                                //district: $scope.orderInfo.sDistrict,
                                postCode: $scope.orderInfo.sPostCode ? $scope.orderInfo.sPostCode : '',
                                detailAddress: $scope.orderInfo.sDetailAddress,
                                maleInfo: {
                                    quantity: 0,
                                    clothesSize: $scope.orderInfo.clothesSize
                                },
                                femaleInfo: {
                                    quantity: 0,
                                    clothesSize: $scope.orderInfo.clothesSize
                                },
                                kidInfo: {
                                    quantity: 0,
                                    clothesSize: $scope.orderInfo.clothesSize
                                },
                                coupons: $scope.orderInfo.usedCoupons
                            }
                        };
                        if ($scope.orderInfo.clothesGender === 'male') {
                            oParam.data.maleInfo.quantity = $scope.orderInfo.clothesQuanaity;
                        } else if ($scope.orderInfo.clothesGender === 'female') {
                            oParam.data.femaleInfo.quantity = $scope.orderInfo.clothesQuanaity;
                            if ($scope.orderInfo.clothesSize === 'S') {
                                oParam.data.femaleInfo.clothesSize = 'XS';
                            } else if ($scope.orderInfo.clothesSize === 'M') {
                                oParam.data.femaleInfo.clothesSize = 'S';
                            } else if ($scope.orderInfo.clothesSize === 'L') {
                                oParam.data.femaleInfo.clothesSize = 'M';
                            } else {
                                oParam.data.femaleInfo.clothesSize = 'L';
                            }
                        } else {
                            oParam.data.kidInfo.quantity = $scope.orderInfo.clothesQuanaity;
                        }

                        Design.DesignManager.create(oParam, function(oData) {
                            if (oData.error) {
                                $scope.updateDesignToolRow(true);
                                $state.go('^');
                                $scope.aMessage.push({
                                    type: 'danger',
                                    content: '创建订单竟然失败了。。。亲，能稍后再尝试吗'
                                });
                            } else {
                                $scope.orderInfo.orderId = oData.data._id;
                                $scope.orderInfo.creatorId = oData.data.creatorId;
                                UIData.setData('orderInfo', $scope.orderInfo);
                                UIData.setData('designInfo', $scope.designInfo);
                                $state.go('payWechatOrder', {showwxpaytitle : 1});
                            }
                        });
                    };

                    $scope.onPaySourceBtnClicked = function() {
                        $state.go('createDesign.createDetail.paySourceList');
                    };

                    $scope.onPayCouponBtnClicked = function() {
                        $scope.updateDesignToolRow(false);
                        $state.go('createDesign.createDetail.payCouponList');
                    };

                    $scope.calcPay = function() {
                        var iCouponValue = 0;
                        for (var i = 0; i < $scope.orderInfo.usedCoupons.length; i++) {
                            iCouponValue += $scope.orderInfo.usedCoupons[i].couponValue;
                        };
                        $scope.orderInfo.totalPay = $scope.constant.ORIGIN_PRICE * $scope.orderInfo.clothesQuanaity - 
                            iCouponValue;
                    };

                    $scope.calcPay();
                }
            }
        }
    }).state('createDesign.createDetail.orderMore', {
        views: {
            'orderMore' : {
                templateUrl: 'views/orderMore.html',
                controller: function($scope, $state, Design) {

                }
            }
        }
    }).state('createDesign.createDetail.paySourceList', {
        //url: '/addressDetail',
        // templateUrl: 'views/createDetail.html',
        // controller: 'CreateDetailCtrl'
        views: {
            'paySourceList' : {
                templateUrl: 'views/paySourceList.html',
                controller: function($scope, $state, Design) {
                    //$scope.saveDetailtest = "this is test string in saveDetail.";
                    $scope.onBackFromPaySourceListClicked = function() {
                        $state.go('createDesign.createDetail.orderDesign');
                    };
                }
            }
        }
    }).state('createDesign.createDetail.payCouponList', {
        //url: '/addressDetail',
        // templateUrl: 'views/createDetail.html',
        // controller: 'CreateDetailCtrl'
        views: {
            'payCouponList' : {
                templateUrl: 'views/payCouponList.html',
                controller: function($scope, $state, Design) {
                    var oParam = {
                        action: 'getMyCoupons',
                        userId: $scope.userInfo.userId
                    };
                    Design.DesignManager.query(oParam, function(oData) {
                        oData.data.forEach(function(oItem) {
                            oItem.selected = false;
                            oItem.validFrom = new Date(oItem.validFrom);
                            oItem.validTo = new Date(oItem.validTo);
                        });
                        $scope.aCoupons = oData.data;
                    });

                    $scope.onCouponItemSelectClicked = function(oCoupon) {
                        if ($scope.aCoupons.length > 1) {
                            var bPreSelected = oCoupon.selected;
                            $scope.aCoupons.forEach(function(oItem) {
                                oItem.selected = false;
                            });
                            oCoupon.selected = !bPreSelected;
                        } else {
                            oCoupon.selected = !oCoupon.selected;
                        }

                        if (oCoupon.selected) {
                            $scope.orderInfo.usedCoupons = [oCoupon];
                            $scope.orderInfo.couponPay = oCoupon.couponValue;
                        } else {
                            $scope.orderInfo.usedCoupons = [];
                            $scope.orderInfo.couponPay = 0;
                        }
                        
                        // if (!!oCoupon.selected) {
                        //     oCoupon.selected = false;
                        // } else {
                        //     oCoupon.selected = true;
                        // }
                    };

                    $scope.onBackFromPayCouponListClicked = function() {
                        $scope.updateDesignToolRow(false);
                        $state.go('createDesign.createDetail.orderDesign');
                    };
                }
            }
        }
    }).state('createDesign.createDetail.addressDetail', {
        //url: '/addressDetail',
        // templateUrl: 'views/createDetail.html',
        // controller: 'CreateDetailCtrl'
        views: {
            'addressDetail' : {
                templateUrl: 'views/addressDetail.html',
                controller: function($scope, $state, Design) {
                    //$scope.saveDetailtest = "this is test string in saveDetail.";
                    $scope.onSaveAddressButtonClicked = function() {
                        var bValid = $scope.validateAddressInfo();
                        if (bValid) {
                            $scope.onBackFromAddreeDetailClicked();
                        }
                    };
                }
            }
        }
    });

    hammerDefaultOptsProvider.set({
        recognizers: [
          [Hammer.Tap,{ event: 'tap'}],
          [Hammer.Tap, { event: 'doubletap', taps: 2 }, [], ['tap']],
          [Hammer.Press],
          [Hammer.Pan]
        ]
    });
}]);

oCreateDesign.controller('CreateDesignCtrl', ['$scope', '$location', '$upload', '$state', '$modal', 'Design', 'Auth', 'UIData', 
    function($scope, $location, $upload, $state, $modal, Design, Auth, UIData) {
        $scope.test = {
            larry: {
                openId: 'oMOsBtzA2Kbns3Dulc2s6upB5ZBw',
                _id: '553cb49b8fb6ac1c2d3d11bd'
            }
        };

        var oAppData = UIData.getAppData();
        var sCode = $location.$$search.code;
        //alert(sCode);
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
            
            Auth.AuthManager.query(oUserReqParam, function (oData) {
                var oResUserInfo = oData.data;
                oResUserInfo.userId = oResUserInfo._id;
                UIData.setData('userInfo', oResUserInfo);
                $scope.userInfo = oResUserInfo;
            });
        }

        $scope.aSelectedArtifact = [];
        $scope.aMessage = [];
        $scope.busyViewStyle = "display:none;"
        $scope.sActiveFeature = 'none';
        $scope.sPublicArtifactType = 'none';
        $scope.isManagingArtifacts = false;

        $scope.mBufferedPublicArtifact = {

        };

        $scope.showBusy = function() {
            $scope.busyViewStyle = "";
        };

        $scope.hideBusy = function() {
            $scope.busyViewStyle = "display:none;";
        };

        // var oAuthParam = {
        //     action: 'getUserIdByWechatId',
        //     wechatId: $scope.test.larry.openId
        // };
        // Auth.AuthManager.query(oAuthParam, function(oData) {
        //     $scope.test.larry._id = oData.data._id;
        // });

        $scope.constant = {
            ORIGIN_PRICE: 99
        };
        $scope.designInfo = {
            bPublicDesign: true,
            sDefaultDesc: new Date().toUTCString(),
            sBackgroundColor: '白',
            sSize: 'XL',
            sDescription: 'test',
            bSaved: false
        };

        $scope.orderInfo = {
            clothesQuanaity: 1,
            clothesSize: 'L',
            clothesGender: $scope.designInfo.sGender,
            defaultQuantityAction: '加',
            totalPay: 0,
            usedCoupons: []
        };

        $scope.htmlItemStyle = {
            availableArea: {
                visible: false,
                width: 0,
                height: 0,
                styleStr: "visible:false;width:0px;height:0px;"
            },
            designToolArea: {
                visible: true,
                styleStr: ""
            },
            previewBackgroundStyle: "display:none;"
        };

        $scope.setDesignInfo = function(oDesign) {
            $scope.designInfo = oDesign;
        };

        $scope.setOrderInfo = function(oOrder) {
            $scope.orderInfo = oOrder;
        };

        // $scope.bPrivateDesign = false;
        // $scope.defultDesc = new Date().toUTCString();

        $scope.onCreateDesignClicked = function () {
            //GO TO SAVE PAGE
            $scope.updateDesignToolRow(false);
            if ($scope.sActiveFeature !== 'none') {
                $scope.sActiveFeature = 'none';
            }
            $state.go('createDesign.createDetail.saveDetail');
        };

        $scope.onSaveDesignBtnClicked = function () {
            if ($scope.aSelectedArtifact.length < 1) {
                $scope.aMessage.push({
                    type: 'danger',
                    content: '您还没有选择素材'
                });
                return;
            }

            var oNewDesign = {
                creatorId: $scope.userInfo.userId,
                color: $scope.designInfo.color,
                gender: $scope.designInfo.sGender,
                price: $scope.constant.ORIGIN_PRICE,
                desc: $scope.designInfo.sDescription,
                access: $scope.designInfo.bPublicDesign ? 'review' : 'private',
                artifacts: []
            };

            for(var i = 0; i < $scope.aSelectedArtifact.length; i++) {
                var oCurArti = $scope.aSelectedArtifact[i];
                var oArtiParam = {
                    fileId: oCurArti.fileId,
                    relativeWidth: oCurArti.imgWidth / $scope.htmlItemStyle.availableArea.width,
                    relativeTop: (oCurArti.styleValue.top - $scope.htmlItemStyle.availableArea.top) / $scope.htmlItemStyle.availableArea.height,
                    relativeLeft: (oCurArti.styleValue.left - $scope.htmlItemStyle.availableArea.left) / $scope.htmlItemStyle.availableArea.width
                };
                oNewDesign.artifacts.push(oArtiParam);
            }
            // var oNewDesign = {
            //     creatorId: $scope.designInfo.sCreatorId,
            //     color: $scope.designInfo.sBackgroundColor === '白' ? 'white' : 'black',
            //     model: "Wave2015",
            //     price: 100,
            //     size: $scope.designInfo.sSize,
            //     style: "Casual",
            //     desc: $scope.designInfo.sDefaultDesc,
            //     access: $scope.designInfo.bPrivateDesign ? 'private' : 'public'
            // };
            var oParam = {
                action: 'createDesign',
                data: oNewDesign
            };
            $scope.showBusy();
            Design.DesignManager.create(oParam, function(oDesign) {
                if (oDesign.status === 'OK') {
                    $scope.hideBusy();
                    clearTimeout($scope.lastCreateDesignTimer);
                    $scope.designInfo.bSaved = true;
                    $scope.designInfo.designId = oDesign.data.designId;
                    $scope.designInfo.previewImageFile = oDesign.data.previewImageFile;
                } else {
                    // var output = '';
                    // for (property in oDesign) {
                    //     output += property + ': ' + oDesign[property]+';\n';
                    // }
                    // alert(output);
                }

                // $scope.hideBusy();
                // $scope.designInfo.bSaved = true;
                // $scope.designInfo.designId = oDesign.data.designId;
                // if (oDesign.data.previewImage64Array && oDesign.data.previewImage64Array.length > 1) {
                //     $scope.designInfo.previewImage64 = oDesign.data.previewImage64Array.join('');
                // } else {
                //     $scope.designInfo.previewImage64 = oDesign.data.previewImage64;
                // }
            });
            
            $scope.lastCreateDesignTime = new Date().getTime();
            $scope.lastCreateDesignTimer = setTimeout(function() {
                $scope.saftyCheckOfBusy(oNewDesign);
            }, 20000);
        };

        $scope.saftyCheckOfBusy = function(oTargetDesign) {
            if ($scope.busyViewStyle === "") {
                oTargetDesign.requestSentTime = $scope.lastCreateDesignTime;
                var oParam = {
                    action: 'guessDesignCreated',
                    data: oTargetDesign
                };
                Design.DesignManager.update(oParam, function(oData) {
                    if (oData.error || oData.data === 'NOT_FOUND') {
                        $scope.hideBusy();
                        $scope.designInfo.bSaved = false;
                        $scope.aMessage.push({
                            type: 'danger',
                            content: oData.error || oData.data
                        });
                    } else {
                        $scope.hideBusy();
                        $scope.designInfo.bSaved = true;
                        $scope.designInfo.designId = oData.data._id;
                        $scope.designInfo.previewImage64 = oData.data.previewImage64;
                    }
                });
            }
        }

        $scope.closeAlert = function(index) {
            $scope.aMessage.splice(index, 1);
        };

        $scope.updateDesignToolRow = function(bShow) {
            if (!bShow) {
                $scope.htmlItemStyle.designToolArea.visible = false;
                $scope.htmlItemStyle.designToolArea.styleStr = "display:none;";
            } else {
                $scope.htmlItemStyle.designToolArea.visible = true;
                $scope.htmlItemStyle.designToolArea.styleStr = "";
            }
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

        $scope.onChangeColorClicked = function() {
            var sCurColor = $scope.designInfo.color;
            var sTargetColor = sCurColor === 'white' ? 'black' : 'white';
            var sCurGender = $scope.designInfo.gender;
            $scope.setDesignGenderColor(sCurGender, sTargetColor);
            ///getFileContent($scope.test.fileId);
        };

        $scope.changeSize = function(sSize) {
            $scope.designInfo.sSize = sSize;
        };

        $scope.setDesignGenderColor = function(sGender, sColor) {
            $scope.designInfo.sGender = sGender;
            $scope.designInfo.gender = sGender;
            $scope.designInfo.color = sColor;
            $scope.orderInfo.clothesGender = sGender;
            $scope.orderInfo.color = sColor;
            if ($scope.designInfo.gender === 'male') {
                if ($scope.designInfo.color === 'white') {
                    $scope.designInfo.bkImg = 'img/male_white.png';
                    $scope.designInfo.previewBkImg = 'img/male_white_preview.png';
                    var aStylePart = $scope.htmlItemStyle.availableArea.styleStr.split(';');
                    aStylePart.splice(aStylePart.length - 2, 2);
                    $scope.htmlItemStyle.availableArea.styleStr = aStylePart.join(';');
                    $scope.htmlItemStyle.availableArea.styleStr += ';'
                } else {
                    $scope.designInfo.bkImg = 'img/male_black.png';
                    $scope.designInfo.previewBkImg = 'img/male_black_preview.png';
                    $scope.htmlItemStyle.availableArea.styleStr += 'background-color:rgba(255,255,255,0.3);';
                }
            } else {
                if ($scope.designInfo.color === 'white') {
                    $scope.designInfo.bkImg = 'img/female_white.png';
                    $scope.designInfo.previewBkImg = 'img/female_white_preview.png';
                    if ($scope.htmlItemStyle.previewBackgroundStyle === '') {
                        var sNewStyle = $scope.addKeyToStyle($scope.htmlItemStyle.availableArea.styleStr, 'background-color', 'inherit');
                        $scope.htmlItemStyle.availableArea.styleStr = sNewStyle;
                    } else {
                        var sNewStyle = $scope.removeKeyFromStyle($scope.htmlItemStyle.availableArea.styleStr, 'background-color');
                        $scope.htmlItemStyle.availableArea.styleStr = sNewStyle;
                    }
                } else {
                    $scope.designInfo.bkImg = 'img/female_black.png';
                    $scope.designInfo.previewBkImg = 'img/female_black_preview.png';
                    if ($scope.htmlItemStyle.previewBackgroundStyle === '') {
                        var sNewStyle = $scope.addKeyToStyle($scope.htmlItemStyle.availableArea.styleStr, 'background-color', 'inherit');
                        $scope.htmlItemStyle.availableArea.styleStr = sNewStyle;
                    } else {
                        var sNewStyle = $scope.addKeyToStyle($scope.htmlItemStyle.availableArea.styleStr, 'background-color', 'rgba(255,255,255,0.3)');
                        $scope.htmlItemStyle.availableArea.styleStr = sNewStyle;
                    }
                }
            }
        };

        $scope.onMaleSelected = function() {
            $scope.setDesignGenderColor('male', 'white');
            $state.go("createDesign.createDetail");
        };

        $scope.onFemalerSelected = function() {
            $scope.setDesignGenderColor('female', 'white');
            $state.go("createDesign.createDetail");
        };

        $scope.onCreateDesignBackClicked = function() {
            if ($scope.sActiveFeature !== 'none') {
                $scope.sActiveFeature = 'none';
            }
            $state.go('^');
        };

        $scope.chooseImageFromGallery = function() {
            wx.chooseImage({
                success: function (res) {
                    console.log("images choosed successfully: " + res.localIds);
                }
            });
        };

        $scope.uploadImage = function() {
            console.log("asdfasdf");
        };

        $scope.fileSelected = function(aFile) {
            if (aFile && aFile.length > 0) {
                $scope.open();

                for (var i = 0; i < aFile.length; i++) {
                    var file = aFile[i];
                    $upload.upload({
                        method: 'POST',
                        url: 'uploadFile',
                        file: file,
                        data : {
                            'action': 'uploadFile',
                            'fileName': file.name,
                            'creatorId': $scope.userInfo.userId
                        }
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        $scope.uploadDialogData.uploadProgress = progressPercentage;
                        console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                    }).success(function (data, status, headers, config) {
                        console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                        //$scope.imgSrc = 'file/getFileContent/' + data.fileId;
                        //$scope.test.fileId = data.fileId;
                        //getFileContent(data.fileId);

                        //$scope.aMyArtifact.push(data.data);
                        $scope.insertNewArtifact2Carousel(data.data);
                        $scope.aMyArtifactCarouselIndex = $scope.aMyArtifact.length - 1;
                        //$scope.$apply();
                        // setTimeout(function() {
                        //     $scope.aMyArtifactCarouselIndex = $scope.aMyArtifact.length - 1;
                        // }, 500);
                        

                        $scope.uploadDialogData.cancel($scope.modalInstance);//Close upload progress dialog
                        $scope.uploadDialogData = null;
                    });
                }
            }
        };

        $scope.open = function () {

            var modalInstance = $modal.open({
                templateUrl: 'views/uploadDialog.html',
                controller: function($scope) {
                    $scope.uploadProgress = 0;
                    $scope.$parent.uploadDialogData = $scope;

                    $scope.cancel = function (oInstance) {
                        if (oInstance) {
                            oInstance.dismiss('cancel');
                        } else {
                            $scope.modalInstance.dismiss('cancel');
                        }
                    };
                },
                size: 'lg',
                scope: $scope
                // resolve: {
                //     items: function () {
                //         return $scope.items;
                //     }
                // }
            });
            $scope.modalInstance = modalInstance;

            // modalInstance.result.then(function (selectedItem) {
            // $scope.selected = selectedItem;
            // }, function () {
            // $log.info('Modal dismissed at: ' + new Date());
            // });
        };
        
        $scope.getFileContent = function(sFileId) {
            var oParam = {
                action: 'getFileContent',
                fileId: $scope.test.fileId
            };
            var oFileContent = Design.FileManager.query(oParam, function(oContent) {
                $scope.midImgSrc = 'data:image/png;base64,' + oContent.data.midImage64;
                $scope.largeImgSrc = 'data:image/png;base64,' + oContent.data.largeImage64;
            });
        };

        $scope.getMyArtifactThumbnails = function() {
            var oParam = {
                action: 'getMyArtifactThumbnails',
                userId: $scope.userInfo.userId
            };
            var oArtifacts = Design.FileManager.query(oParam, function(oContent) {
                //$scope.imgSrc = 'data:image/png;base64,' + oContent.data;
                $scope.aMyArtifact = $scope.groupArtifactThumbnails(oContent.data, 4);
                $scope.aMyArtifactCarouselIndex = 0;
            });
        };

        $scope.getPublicArtifactThumbnails = function(sTargetType) {
            if (!$scope.mBufferedPublicArtifact[sTargetType] || $scope.mBufferedPublicArtifact[sTargetType].length < 1) {
                var oParam = {
                    action: 'getPublicArtifactThumbnails',
                    artifactType: sTargetType
                };
                var oArtifacts = Design.FileManager.query(oParam, function(oContent) {
                    //$scope.imgSrc = 'data:image/png;base64,' + oContent.data;
                    $scope.aPublicArtifact = $scope.groupArtifactThumbnails(oContent.data, 6);
                    $scope.aPublicArtifactCarouselIndex = 0;
                    $scope.mBufferedPublicArtifact[sTargetType] = $scope.aPublicArtifact;
                });
            } else {
                $scope.aPublicArtifact = $scope.mBufferedPublicArtifact[sTargetType];
                $scope.aPublicArtifactCarouselIndex = 0;
            }
        };

        $scope.groupArtifactThumbnails = function(aThumbnail, iGroupSize) {
            var oRet = [];
            var iSize = 4;
            if (aThumbnail && aThumbnail.length > 0) {
                if (!!iGroupSize) {
                    iSize = iGroupSize;
                }
                var iCount = Math.floor(aThumbnail.length / iSize) + 1;

                for (var i = 0; i < iCount - 1; i++) {
                    var oGroup = [];
                    for (var j = 0; j < iSize; j++) {
                        oGroup.push(aThumbnail[i*iSize + j]);
                    }
                    // oGroup.push(aThumbnail[i*iSize]);
                    // oGroup.push(aThumbnail[i*iSize + 1]);
                    // oGroup.push(aThumbnail[i*iSize + 2]);
                    // oGroup.push(aThumbnail[i*iSize + 3]);

                    oRet.push(oGroup);
                }

                var iLeft = aThumbnail.length - (iCount - 1) * iSize;
                if (iLeft > 0) {
                    var oLeftGroup = [];
                    for (var j = 0; j < iLeft; j++) {
                        oLeftGroup.push(aThumbnail[(iCount - 1) * iSize + j]);
                    }
                    oRet.push(oLeftGroup);
                }
            }
            return oRet;
        };

        $scope.insertNewArtifact2Carousel = function(oThumbnail) {
            if (!$scope.aMyArtifact) {
                $scope.aMyArtifact = [];
            }

            if ($scope.aMyArtifact.length < 1) {
                var oGroup = [oThumbnail];
                $scope.aMyArtifact.push(oGroup);
            } else {
                var iLastGroupIdx = $scope.aMyArtifact.length - 1;
                var oLastGroup = $scope.aMyArtifact[iLastGroupIdx];
                if (oLastGroup.length < 4) {
                    oLastGroup.push(oThumbnail);
                } else {
                    var oGroup = [oThumbnail];
                    $scope.aMyArtifact.push(oGroup);
                }
            }
        };

        $scope.onArtifactSelected = function(oArtifact) {
            // oArtifact.styleValue = //'top:50px;left:100px;' + 
            //     'transform:rotate(7deg);' + 
            //     '-o-transform:rotate(7deg);' + 
            //     '-webkit-transform: rotate(7deg);' + 
            //     '-moz-transform: rotate(7deg);';
            oArtifact.isEditting = false;
            oArtifact.styleValue = {};
            oArtifact.styleValue.top = 150;
            oArtifact.styleValue.left = 80;
            oArtifact.styleValue.pencilLeft = -20 + oArtifact.styleValue.left;

            oArtifact.imgWidth = 160;

            oArtifact.styleStr = "top:" + oArtifact.styleValue.top + "px;" + 
                "left:" + oArtifact.styleValue.left + "px;" + 
                "width:" + oArtifact.imgWidth + "px;";

            //oArtifact.styleStr = $scope.addKeyToStyle(oArtifact.styleStr, 'border', '2px dotted rgb(215, 180, 104)');

            oArtifact.pencilStyleStr = "top:" + oArtifact.styleValue.top + "px;" + 
                "left:" + oArtifact.styleValue.pencilLeft + "px;";

            // var img = new Image();
            // img.src = oArtifact.largeImage64;
            // img.onload = function() {
            //     //console.log(img.width);   // This will print out the width.
            //     //oArtifact.imgWidth = img.width*0.7;
            //     oArtifact.originImgWidth = img.width;
            //     oArtifact.originImgHeight = img.height;
            //     oArtifact.imgHeight = oArtifact.imgWidth/oArtifact.originImgWidth*oArtifact.originImgHeight


            //     var iResizeTop = oArtifact.styleValue.top - oArtifact.imgHeight/2 + 2;//original 70% width limit
            //     var iResizeLeft = oArtifact.styleValue.pencilLeft - 30;//Need to consider pencil width
            //     oArtifact.resizeStyleStr = "top:" + iResizeTop + "px;" + 
            //     "left:" + iResizeLeft + "px;";

            //     var iRemoveLeft = oArtifact.styleValue.pencilLeft - oArtifact.imgWidth - 30*2;//Need to consider pencil&resize width
            //     oArtifact.removeStyleStr = "top:" + iResizeTop + "px;" + 
            //     "left:" + iRemoveLeft + "px;";
                
            //     oArtifact.lastDragDistance = 0;

            //     $scope.aSelectedArtifact.push(oArtifact);
            //     $scope.updateAvailableAreaStyle();
            //     if ($scope.sActiveFeature !== 'none') {
            //         $scope.sActiveFeature = 'none';
            //     }
            //     $state.go('^');
            // }

            var oPreviewInfo = JSON.parse(oArtifact.previewInfo);
            oArtifact.originImgWidth = oPreviewInfo.width;
            oArtifact.originImgHeight = oPreviewInfo.height;
            oArtifact.imgHeight = oArtifact.imgWidth/oArtifact.originImgWidth*oArtifact.originImgHeight


            var iResizeTop = oArtifact.styleValue.top - oArtifact.imgHeight/2 + 2;//original 70% width limit
            var iResizeLeft = oArtifact.styleValue.pencilLeft - 30;//Need to consider pencil width
            oArtifact.resizeStyleStr = "top:" + iResizeTop + "px;" + 
            "left:" + iResizeLeft + "px;";

            var iRemoveLeft = oArtifact.styleValue.pencilLeft - oArtifact.imgWidth - 30*2;//Need to consider pencil&resize width
            oArtifact.removeStyleStr = "top:" + iResizeTop + "px;" + 
            "left:" + iRemoveLeft + "px;";
            
            oArtifact.lastDragDistance = 0;

            $scope.aSelectedArtifact.push(oArtifact);
            $scope.updateAvailableAreaStyle();
            if ($scope.sActiveFeature !== 'none') {
                $scope.sActiveFeature = 'none';
            }
            $state.go('^');
        };

        $scope.onPublicArtifactTypeClicked = function(sType) {
            if ($scope.sPublicArtifactType !== sType) {
                $scope.getPublicArtifactThumbnails(sType);
                $scope.sPublicArtifactType = sType;
            }
        };

        $scope.restoreActiveFeature = function() {
            $state.go('^');
            $scope.sActiveFeature = 'none';
        };

        $scope.updateAvailableAreaStyle = function() {
            var oBkImg = $('.createDesignBgImg')[0];
            var iWidth = oBkImg.clientWidth;
            var iHeight = oBkImg.clientHeight;
            $scope.htmlItemStyle.availableArea.visible = true;
            $scope.htmlItemStyle.availableArea.width = iWidth * 0.63;
            $scope.htmlItemStyle.availableArea.height = $scope.htmlItemStyle.availableArea.width * 1.5;
            $scope.htmlItemStyle.availableArea.left = iWidth * 0.20;
            $scope.htmlItemStyle.availableArea.top = iHeight * 0.20;

            if ($scope.aSelectedArtifact.length > 0) {
                $scope.htmlItemStyle.availableArea.styleStr = "visibility:visible;" + 
                "width:" + $scope.htmlItemStyle.availableArea.width + "px;" + 
                "height:" + $scope.htmlItemStyle.availableArea.height + "px;" + 
                "left:" + $scope.htmlItemStyle.availableArea.left + "px;" + 
                "top:" + $scope.htmlItemStyle.availableArea.top + "px;";
                if ($scope.designInfo.color !== 'white') {
                    $scope.htmlItemStyle.availableArea.styleStr += 'background-color: rgba(255,255,255,0.3);';
                }
            } else {
                $scope.htmlItemStyle.availableArea.styleStr = "visibility:hidden;" + 
                "width:" + $scope.htmlItemStyle.availableArea.width + "px;" + 
                "height:" + $scope.htmlItemStyle.availableArea.height + "px;";
            }
            
        };

        $scope.onSelectedArtiItemDragged = function($event, oArtifact) {
            //console.log($event.gesture);
            console.log('dragging!');
            console.log($event.target.clientWidth);
            //hm-drag="onSelectedArtiItemDragged($event, oArtifact)"
            //event.gesture.preventDefault();
        };

        $scope.onSelectedArtiItemDragstart = function($event, oArtifact) {
            //console.log($event.gesture);
            console.log('dragging start!');
            //event.gesture.preventDefault();
        };

        $scope.onSelectedArtiItemDragend = function($event, oArtifact) {
            //console.log($event.gesture);
            console.log('dragging end!');
            oArtifact.styleValue.top += $event.deltaY;
            oArtifact.styleValue.left += $event.deltaX;
            oArtifact.styleValue.pencilLeft = -20 + oArtifact.styleValue.left;

            var iImgWidth = $event.target.clientWidth + 4;//Need to consider 2px border
            oArtifact.imgWidth = iImgWidth;

            oArtifact.styleStr = "top:" + oArtifact.styleValue.top + "px;" + 
                "left:" + oArtifact.styleValue.left + "px;" + 
                "width:" + iImgWidth + "px;";

            oArtifact.pencilStyleStr = "top:" + oArtifact.styleValue.top + "px;" + 
                "left:" + oArtifact.styleValue.pencilLeft + "px;";

            var iResizeTop = oArtifact.styleValue.top - $event.target.clientHeight/2 + 2;
            var iResizeLeft = oArtifact.styleValue.pencilLeft - 30;//Need to consider pencil width
            oArtifact.resizeStyleStr = "top:" + iResizeTop + "px;" + 
                "left:" + iResizeLeft + "px;";

            var iRemoveLeft = oArtifact.styleValue.pencilLeft - oArtifact.imgWidth - 30*2;
            oArtifact.removeStyleStr = "top:" + iResizeTop + "px;" + 
                "left:" + iRemoveLeft + "px;";
            //event.gesture.preventDefault();
        };

        $scope.onSelectedArtiItemResizeDrag = function($event, oArtifact) {
            var iDistance = $event.distance;

            console.log('resize dragging' + iDistance);

            var iDeltaDragDistance = iDistance - oArtifact.lastDragDistance;
            if (iDeltaDragDistance > 10) {
                var iPercent;
                if ($event.deltaX > 0) {
                    iPercent = 1 + iDistance/400;
                } else {
                    iPercent = 1 - iDistance/400;
                }

                oArtifact.styleStr = "top:" + oArtifact.styleValue.top + "px;" + 
                    "left:" + oArtifact.styleValue.left + "px;" + 
                    "width:" + oArtifact.imgWidth*iPercent + "px;";

                var iResizeTop = oArtifact.styleValue.top - oArtifact.imgHeight*iPercent/2 + 2;
                var iResizeLeft = oArtifact.styleValue.pencilLeft - 30;//Need to consider pencil width

                oArtifact.resizeStyleStr = "top:" + iResizeTop + "px;" + 
                    "left:" + iResizeLeft + "px;";

                var iRemoveTop = oArtifact.styleValue.top - oArtifact.imgHeight*iPercent/2 + 2;
                var iRemoveLeft = oArtifact.styleValue.pencilLeft - oArtifact.imgWidth*iPercent - 30*2;
                oArtifact.removeStyleStr = "top:" + iResizeTop + "px;" + 
                "left:" + iRemoveLeft + "px;";

                console.log(oArtifact.styleStr);
                oArtifact.lastDraggingWidth = oArtifact.imgWidth*iPercent;
                oArtifact.lastDraggingHeight = oArtifact.imgHeight*iPercent;

                oArtifact.lastDragDistance = $event.distance;
            } else if (iDeltaDragDistance < -10) {
                var iPercent;
                if ($event.deltaX > 0) {
                    iPercent = 1 + iDistance/400;
                } else {
                    iPercent = 1 - iDistance/400;
                }

                oArtifact.styleStr = "top:" + oArtifact.styleValue.top + "px;" + 
                    "left:" + oArtifact.styleValue.left + "px;" + 
                    "width:" + oArtifact.imgWidth*iPercent + "px;";
                //oArtifact.imgWidth = oArtifact.originImgWidth*0.7*iPercent;
                //oArtifact.imgHeight = oArtifact.originImgHeight*0.7*iPercent;

                var iResizeTop = oArtifact.styleValue.top - oArtifact.imgHeight*iPercent/2 + 2;
                var iResizeLeft = oArtifact.styleValue.pencilLeft - 30;//Need to consider pencil width
                oArtifact.resizeStyleStr = "top:" + iResizeTop + "px;" + 
                    "left:" + iResizeLeft + "px;";

                var iRemoveTop = oArtifact.styleValue.top - oArtifact.imgHeight*iPercent/2 + 2;
                var iRemoveLeft = oArtifact.styleValue.pencilLeft - oArtifact.imgWidth*iPercent - 30*2;
                oArtifact.removeStyleStr = "top:" + iResizeTop + "px;" + 
                "left:" + iRemoveLeft + "px;";

                console.log(oArtifact.styleStr);
                oArtifact.lastDraggingWidth = oArtifact.imgWidth*iPercent;
                oArtifact.lastDraggingHeight = oArtifact.imgHeight*iPercent;

                oArtifact.lastDragDistance = $event.distance;
            }
        };

        $scope.onSelectedArtiItemResizeDragend = function($event, oArtifact) {
            console.log('resize dragging end!');

            // oArtifact.imgWidth = oArtifact.originImgWidth*0.7*iPercent;
            // oArtifact.imgHeight = oArtifact.originImgHeight*0.7*iPercent;
            oArtifact.imgWidth = oArtifact.lastDraggingWidth;
            oArtifact.imgHeight = oArtifact.lastDraggingHeight;
        };

        $scope.onTouched = function($event) {
            //console.log('touched!');
            //alert("touched");
            //event.gesture.preventDefault();
        };

        $scope.onTap = function($event) {
            //console.log('touched!');
            //alert("touched");
            //event.gesture.preventDefault();
        };

        $scope.onDoubleTap = function($event) {
            console.log('double tapped!');
            alert('double tapped!');
        };

        $scope.onSelectedArtiItemPinchOut = function($event, oArtifact) {
            console.log('pinch out');
            //alert('pinch out');
        };

        $scope.onSelectedArtiItemPinchIn = function($event, oArtifact) {
            console.log('pinch in');
            //alert('pinch out');
        };

        $scope.onEditArtifactItemClicked = function(oArtifact) {
            oArtifact.isEditting = true;
        };

        $scope.onRemoveArtifactItemClicked = function(oArtifact) {
            var iTargetIdx = -1;
            for (var i = 0; i < $scope.aSelectedArtifact.length; i++) {
                if ($scope.aSelectedArtifact[i]._id === oArtifact._id) {
                    iTargetIdx = i;
                    break;
                }
            }

            if (iTargetIdx !== -1) {
                $scope.aSelectedArtifact.splice(iTargetIdx, 1);
            }

            $scope.updateAvailableAreaStyle();
        };

        $scope.onPreviewDesignBtnClicked = function() {
            // var oParam = {
            //     action: 'createCustomDesign',
            //     fileId: $scope.test.fileId
            // };
            // var oFileContent = Design.FileManager.create(oParam, function(oContent) {
            //     $scope.midImgSrc = 'data:image/png;base64,' + oContent.data.midImage64;
            //     $scope.largeImgSrc = 'data:image/png;base64,' + oContent.data.largeImage64;
            // });
            if ($scope.htmlItemStyle.previewBackgroundStyle !== "") {
                $scope.htmlItemStyle.previewBackgroundStyle = "";
                for (var i = 0; i < $scope.aSelectedArtifact.length; i++) {
                    var oCurArti = $scope.aSelectedArtifact[i];
                    var sNewStyle = $scope.addKeyToStyle(oCurArti.styleStr, 'border', 'none');
                    oCurArti.styleStr = sNewStyle;
                }

                if ($scope.designInfo.color === 'white') {
                    var sNewAvailableStyle = $scope.addKeyToStyle($scope.htmlItemStyle.availableArea.styleStr, 'background-color', 'inherit');
                    $scope.htmlItemStyle.availableArea.styleStr = sNewAvailableStyle;
                } else {
                    var sNewAvailableStyle = $scope.addKeyToStyle($scope.htmlItemStyle.availableArea.styleStr, 'background-color', 'inherit');
                    $scope.htmlItemStyle.availableArea.styleStr = sNewAvailableStyle;
                }
            } else {
                $scope.htmlItemStyle.previewBackgroundStyle = "display:none;";
                for (var i = 0; i < $scope.aSelectedArtifact.length; i++) {
                    var oCurArti = $scope.aSelectedArtifact[i];
                    var sNewStyle = $scope.removeKeyFromStyle(oCurArti.styleStr, 'border');
                    oCurArti.styleStr = sNewStyle;
                }

                if ($scope.designInfo.color === 'white') {
                    var sNewAvailableStyle = $scope.removeKeyFromStyle($scope.htmlItemStyle.availableArea.styleStr, 'background-color');
                    $scope.htmlItemStyle.availableArea.styleStr = sNewAvailableStyle;
                } else {
                    var sNewAvailableStyle = $scope.addKeyToStyle($scope.htmlItemStyle.availableArea.styleStr, 'background-color', 'rgba(255,255,255,0.3)');
                    $scope.htmlItemStyle.availableArea.styleStr = sNewAvailableStyle;
                }
            }
        };

        $scope.onBack2DesignDetailClicked = function() {
            $scope.updateDesignToolRow(true);
            $state.go('^');
        };

        $scope.onOrderBtnClicked = function() {
            $state.go('createDesign.createDetail.orderDesign');
            //$state.go('payWechatOrder');
        };

        $scope.onBack2SaveDetailClicked = function() {
            $scope.updateDesignToolRow(true);
            $state.go('^');
        };

        $scope.onPrepareShareButtonClicked = function() {
            var sDesignId = $scope.designInfo.designId ? $scope.designInfo.designId : $scope.designInfo._id;
            $state.go('myDesigns.designDetail', {designId: sDesignId, showwxpaytitle: 1});
        };

        $scope.onEditAddressDetailClicked = function() {
            $state.go('createDesign.createDetail.addressDetail');
        };

        $scope.onBackFromAddreeDetailClicked = function() {
            var bValid = $scope.validateAddressInfo();
            if (bValid) {
                $scope.getAddressInfoSummary();
            }
            $state.go('createDesign.createDetail.orderDesign');
        };

        $scope.getAddressInfoSummary = function() {
            var oOrderInfo = $scope.orderInfo;
            if (!oOrderInfo) {
                return '';
            } else {
                var sInfo = '';
                sInfo += oOrderInfo.sContact;
                sInfo += ' ';
                sInfo += oOrderInfo.sMobile;
                sInfo += ' ';
                sInfo += oOrderInfo.sDetailAddress;

                oOrderInfo.mailInfoSummary = sInfo.substr(0, 20);
                oOrderInfo.mailInfoSummary += '...'
                return oOrderInfo.mailInfoSummary;
            }
        };

        $scope.validateAddressInfo = function() {
            var oOrderInfo = $scope.orderInfo;
            if (!oOrderInfo.sContact || oOrderInfo.sContact === '') {
                $scope.aMessage.push({
                    type: 'danger',
                    content: '您还没有提供联系人姓名'
                });
                return false;
            }
            
            if (!oOrderInfo.sMobile || oOrderInfo.sMobile === '') {
                $scope.aMessage.push({
                    type: 'danger',
                    content: '您还没有提供联系人手机号码'
                });
                return false;
            } else {
                var oPhoneReg = /^1[3|4|5|8][0-9]\d{8,8}$/;
                var bPhoneTest = oPhoneReg.test(oOrderInfo.sMobile);
                if (!bPhoneTest) {
                    $scope.aMessage.push({
                        type: 'danger',
                        content: '请输入正确的联系人手机号码'
                    });
                    return false;
                }
            }

            /*if ((!oOrderInfo.sProvince || oOrderInfo.sProvince === '') && 
                (!oOrderInfo.sCity || oOrderInfo.sCity === '')) {
                $scope.aMessage.push({
                    type: 'danger',
                    content: '您还没有提供省、市位置'
                });
                return false;
            };

            if (!oOrderInfo.sProvince || oOrderInfo.sProvince === '') {
                if ((oOrderInfo.sCity !== '北京市' && oOrderInfo.sCity !== '北京省' && oOrderInfo.sCity !== '北京') &&
                    (oOrderInfo.sCity !== '天津市' && oOrderInfo.sCity !== '天津省' && oOrderInfo.sCity !== '天津') && 
                    (oOrderInfo.sCity !== '上海市' && oOrderInfo.sCity !== '上海省' && oOrderInfo.sCity !== '上海') && 
                    (oOrderInfo.sCity !== '重庆市' && oOrderInfo.sCity !== '重庆省' && oOrderInfo.sCity !== '重庆')) {
                    $scope.aMessage.push({
                        type: 'danger',
                        content: '您还没有提供省、市位置'
                    });
                    return false;
                } else {
                    oOrderInfo.sProvince = oOrderInfo.sCity;
                }
            }

            if (!oOrderInfo.sCity || oOrderInfo.sCity === '') {
                if ((oOrderInfo.sProvince !== '北京市' && oOrderInfo.sProvince !== '北京省' && oOrderInfo.sProvince !== '北京') &&
                    (oOrderInfo.sProvince !== '天津市' && oOrderInfo.sProvince !== '天津省' && oOrderInfo.sProvince !== '天津') && 
                    (oOrderInfo.sProvince !== '上海市' && oOrderInfo.sProvince !== '上海省' && oOrderInfo.sProvince !== '上海') && 
                    (oOrderInfo.sProvince !== '重庆市' && oOrderInfo.sProvince !== '重庆省' && oOrderInfo.sProvince !== '重庆')) {
                    $scope.aMessage.push({
                        type: 'danger',
                        content: '您还没有提供省、市位置'
                    });
                    return false;
                } else {
                    oOrderInfo.sCity = oOrderInfo.sProvince;
                }
            }

            if (!oOrderInfo.sDistrict || oOrderInfo.sDistrict === '') {
                $scope.aMessage.push({
                    type: 'danger',
                    content: '您还没有输入区'
                });
                return false;
            };*/
            
            if (!oOrderInfo.sDetailAddress || oOrderInfo.sDetailAddress === '') {
                $scope.aMessage.push({
                    type: 'danger',
                    content: '您还没有具体邮寄地址'
                });
                return false;
            };

            return true;
        };

        $scope.getMailInfoJsonStr = function() {
            var oOrderInfo = $scope.orderInfo;
            if (!oOrderInfo) {
                return '';
            } else {
                var oInfo = {};
                oInfo.contact = oOrderInfo.sContact;
                oInfo.mobile = oOrderInfo.sMobile;
                oInfo.province = oOrderInfo.sProvince;
                oInfo.city = oOrderInfo.sCity;
                oInfo.district = oOrderInfo.sDistrict;
                oInfo.postCode = oOrderInfo.sPostCode;
                oInfo.detailAddress = oOrderInfo.sDetailAddress;
                var sInfo = JSON.stringify(oInfo);
                return sInfo;
            }
        };

        $scope.removeKeyFromStyle = function(sOriginStyle, sKey) {
            if (sOriginStyle === '') {
                return '';
            }

            var aPairs = sOriginStyle.split(';');

            if (aPairs.length === 1) {
                var sKeyValue = aPairs[0];
                var aValues = sKeyValue.split(':');
                if (aValues.length === 1) {
                    return '';
                } else {
                    if (aValues[0] === sKey) {
                        return '';
                    } else {
                        return sOriginStyle;
                    }
                }
            } else {
                if (aPairs[aPairs.length - 1] === '') {
                    aPairs.splice(aPairs.length - 1, 1);
                }
            }

            var oNewPairs = [];
            for (var i = 0; i < aPairs.length; i++) {
                var oCurPair = aPairs[i];
                var aParts = oCurPair.split(':');
                if (aParts[0] !== sKey) {
                    oNewPairs.push(oCurPair);
                }
            }

            if (oNewPairs.length > 0) {
                return oNewPairs.join(';') + ';';
            } else {
                return '';
            }
        }

        $scope.addKeyToStyle = function(sOriginStyle, sKey, sValue) {
            var sTempStyle = $scope.removeKeyFromStyle(sOriginStyle, sKey);
            return sTempStyle + sKey + ':' + sValue + ';';
        };
}]);

/*oCreateDesign.directive('designArtifact', ['$document', function($document) {
    return {
        // scope: {
        //     dragStart:'&startDragging',
        // },
        priority: 1001,
        link: function(scope, element, attr) {
            var startX = 0, startY = 0, x = 0, y = 0;
            element.css({
                position: 'relative',
                //border: '1px solid red'
                //background-color: 'lightgrey',
                cursor: 'pointer',
                transform: 'rotate(7deg)',
                oTransform: 'rotate(7deg)',
                webkitTransform: 'rotate(7deg)',
                mozTransform: 'rotate(7deg)'
            });

            var dragStartCallback = function(event) {
                //alert('dragStartCallback!');
                //scope.dragStart({e: event});
                console.log('dragStartCallback!');
                //event.preventDefault();
                startX = event.pageX - x;
                startY = event.pageY - y;
                // element[0].addEventListener('drag', dragCallback, false);
                // element[0].addEventListener('dragend', dragEndCallback, false);
            };

            var dragEndCallback = function(event) {
                //alert('dragStartCallback!');
                //scope.dragStart({e: event});
                console.log('dragEndCallback!');
                element[0].removeEventListener('drag');
                element[0].removeEventListener('dragend');
            };

            var dragCallback = function(event) {
                console.log('dragging!');
                y = event.pageY - startY;
                x = event.pageX - startX;
                element.css({
                    top: y + 'px',
                    left:  x + 'px'
                });
            };

            element[0].draggable = true;

            element[0].addEventListener('dragstart', dragStartCallback, false);
            element[0].addEventListener('dragend', dragEndCallback, false);
            element[0].addEventListener('drag', dragCallback, false);
            
            

            // element.on('mousedown', function(event) {
            // // Prevent default dragging of selected content
            //     event.preventDefault();
            //     startX = event.pageX - x;
            //     startY = event.pageY - y;
            //     $document.on('mousemove', mousemove);
            //     $document.on('mouseup', mouseup);
            // });

            // element.on('draggstart', function(event) {
            // // Prevent default dragging of selected content
            //     event.preventDefault();
            //     alert("asdf");
            //     startX = event.pageX - x;
            //     startY = event.pageY - y;
            //     $document.on('mousemove', mousemove);
            //     $document.on('mouseup', mouseup);
            // });

            // element.on('onStart', function(event) {
            // // Prevent default dragging of selected content
            //     event.preventDefault();
            //     startX = event.pageX - x;
            //     startY = event.pageY - y;
            //     $document.on('dragmove', mousemove);
            //     $document.on('dragend', mouseup);
            // });

            // function mousemove(event) {
            //     y = event.pageY - startY;
            //     x = event.pageX - startX;
            //     element.css({
            //         top: y + 'px',
            //         left:  x + 'px'
            //     });
            // }

            // function mouseup() {
            //     $document.off('mousemove', mousemove);
            //     $document.off('mouseup', mouseup);
            // }
        }
    };
}]);*/
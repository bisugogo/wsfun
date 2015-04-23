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
                        $scope.getMyArtifactThumbnails();
                        $state.go('createDesign.createDetail.myGallery');
                    };
                }
            }
        }
    }).state('createDesign.createDetail.myGallery', {
        views: {
            'personalGallery': {
                templateUrl: 'views/personalGallery.html',
                controller: function($scope, $state, Design) {
                    var i = 0;
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
                controller: function($scope, $state, Design, UIData) {
                    //$scope.saveDetailtest = "this is test string in saveDetail.";
                    $scope.orderInfo = {
                        defaultQuanaity: 1,
                        defaultSize: '中',
                        defaultQuantityAction: '加',
                        totalPay: 1001,
                        couponPay: 33
                    };

                    $scope.onIncreaseQuantity = function() {
                        $scope.orderInfo.defaultQuanaity++;
                    };

                    $scope.onDecreaseQuantity = function() {
                        if ($scope.orderInfo.defaultQuanaity > 0) {
                            $scope.orderInfo.defaultQuanaity--;
                        }
                    };

                    $scope.onPayOrderBtnClicked = function() {
                        UIData.setData('designCount', 5);
                        $state.go('payOrder');
                    };

                    $scope.onPaySourceBtnClicked = function() {
                        $state.go('createDesign.createDetail.paySourceList');
                    };

                    $scope.onPayCouponBtnClicked = function() {
                        $state.go('createDesign.createDetail.payCouponList');
                    };
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
                    $scope.aCoupons = [
                        {
                            type: 1,
                            couponValue: 10,
                            selected: true,
                            validFrom: new Date(1428332139683),
                            validTo: new Date(1436332139683)
                        },
                        {
                            type: 1,
                            couponValue: 50,
                            selected: false,
                            validFrom: new Date(1428332139683),
                            validTo: new Date(1438332139683)
                        },
                        {
                            type: 1,
                            couponValue: 5,
                            selected: false,
                            validFrom: new Date(1428332139683),
                            validTo: new Date(1438332139683)
                        },
                        {
                            type: 1,
                            couponValue: 20,
                            selected: false,
                            validFrom: new Date(1428332139683),
                            validTo: new Date(1438332139683)
                        },
                        {
                            type: 1,
                            couponValue: 10,
                            selected: false,
                            validFrom: new Date(1428332139683),
                            validTo: new Date(1438332139683)
                        },
                        {
                            type: 1,
                            couponValue: 35,
                            selected: false,
                            validFrom: new Date(1428332139683),
                            validTo: new Date(1438332139683)
                        },
                    ];

                    $scope.onCouponItemSelectClicked = function(oCoupon) {
                        if (!!oCoupon.selected) {
                            oCoupon.selected = false;
                        } else {
                            oCoupon.selected = true;
                        }
                    };

                    $scope.onBackFromPayCouponListClicked = function() {
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
                _id: ''
            }
        };

        $scope.aSelectedArtifact = [];
        $scope.aMessage = [];
        $scope.busyViewStyle = "display:none;"

        $scope.showBusy = function() {
            $scope.busyViewStyle = "";
        };

        $scope.hideBusy = function() {
            $scope.busyViewStyle = "display:none;";
        };

    //Regist Wechat Interface
    /*var oParam = {
        action: 'getJsAPISignature'
    };

    
    var oSig = Auth.AuthManager.query(oParam, function () {
        console.log(oSig.signature);
        wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: 'wxf26855bd0cda23bd', // 必填，公众号的唯一标识
            timestamp: oSig.timestamp, // 必填，生成签名的时间戳
            nonceStr: oSig.nonceStr, // 必填，生成签名的随机串
            signature: oSig.signature,// 必填，签名，见附录1
            jsApiList: ["chooseImage", "previewImage", "uploadImage", "downloadImage"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });

        wx.ready(function() {
            console.log('js sdk configuration set up successfully.');
        });

        wx.error(function(res){
            console.log('js sdk configuration set up failed!!!');
        });
    });*/

        var oAuthParam = {
            action: 'getUserIdByWechatId',
            wechatId: $scope.test.larry.openId
        };
        Auth.AuthManager.query(oAuthParam, function(oData) {
            $scope.test.larry._id = oData.data._id;
        });

        $scope.constant = {
            SIZE_ARRAY: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            BK_COLOR_ARRYA: ['黑', '白']
        };
        $scope.designInfo = {
            sCreatorId: 'MATT',
            bPublicDesign: true,
            sDefaultDesc: new Date().toUTCString(),
            sBackgroundColor: '白',
            sSize: 'XL',
            sDescription: 'test'
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
            }
        };

        // $scope.bPrivateDesign = false;
        // $scope.defultDesc = new Date().toUTCString();
        $scope.onCreateDesignClicked = function () {
            if ($scope.aSelectedArtifact.length < 1) {
                $scope.aMessage.push({
                    type: 'danger',
                    content: '您还没有选择素材'
                });
                return;
            }

            var oNewDesign = {
                creatorId: '54fed66202f4c3e48e0df896',
                color: 'white',
                gender: 'female',
                price: 100,
                desc: 'test design',
                access: 'public',
                artifacts: []
            };
            for(var i = 0; i < $scope.aSelectedArtifact.length; i++) {
                var oCurArti = $scope.aSelectedArtifact[i];
                var oArtiParam = {
                    fileId: oCurArti.fileId,
                    relativeWidth: oCurArti.imgWidth / $scope.htmlItemStyle.availableArea.width,
                    relativeTop: (oCurArti.styleValue.top - 140) / $scope.htmlItemStyle.availableArea.height,
                    relativeLeft: (oCurArti.styleValue.left - 76) / $scope.htmlItemStyle.availableArea.width
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
                $scope.hideBusy();

                //GO TO SAVE PAGE
                $scope.updateDesignToolRow('saveDetailView');
                $state.go('createDesign.createDetail.saveDetail');
            });
        };

        $scope.closeAlert = function(index) {
            $scope.aMessage.splice(index, 1);
        };

        $scope.updateDesignToolRow = function(sTargeView) {
            if (sTargeView === 'saveDetailView') {
                $scope.htmlItemStyle.designToolArea.visible = false;
                $scope.htmlItemStyle.designToolArea.styleStr = "display:none;";
            } else if(sTargeView === 'designDetailView') {
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

        $scope.changeBackgroundColor = function(sColor) {
            $scope.designInfo.sBackgroundColor = sColor;
            ///getFileContent($scope.test.fileId);
        };

        $scope.changeSize = function(sSize) {
            $scope.designInfo.sSize = sSize;
        };

        $scope.onMaleSelected = function() {
            $scope.designInfo.gender = 'male';
            $state.go("createDesign.createDetail");
        };

        $scope.onFemalerSelected = function() {
            $scope.designInfo.gender = 'female';
            $state.go("createDesign.createDetail");
        };

        $scope.onCreateDesignBackClicked = function() {
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
                            'fileName': $scope.test.larry._id + new Date().getTime(),
                            'creatorId': $scope.test.larry._id
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
                            $modalInstance.dismiss('cancel');
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
                userId: $scope.test.larry._id
            };
            var oArtifacts = Design.FileManager.query(oParam, function(oContent) {
                //$scope.imgSrc = 'data:image/png;base64,' + oContent.data;
                $scope.aMyArtifact = $scope.groupArtifactThumbnails(oContent.data, 4);
                $scope.aMyArtifactCarouselIndex = 0;
            });
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
                    oGroup.push(aThumbnail[i*iSize]);
                    oGroup.push(aThumbnail[i*iSize + 1]);
                    oGroup.push(aThumbnail[i*iSize + 2]);
                    oGroup.push(aThumbnail[i*iSize + 3]);

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

            oArtifact.pencilStyleStr = "top:" + oArtifact.styleValue.top + "px;" + 
                "left:" + oArtifact.styleValue.pencilLeft + "px;";

            var img = new Image();
            img.src = oArtifact.largeImage64;
            //console.log(img.width);       // This might print out 0!
            img.onload = function() {
                //console.log(img.width);   // This will print out the width.
                //oArtifact.imgWidth = img.width*0.7;
                oArtifact.originImgWidth = img.width;
                oArtifact.originImgHeight = img.height;
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
                $state.go('^');
            }

            // $scope.aSelectedArtifact.push(oArtifact);
            // $state.go('^');
        };

        $scope.updateAvailableAreaStyle = function() {
            var oBkImg = $('.createDesignBgImg')[0];
            var iWidth = oBkImg.clientWidth;
            var iHeight = oBkImg.clientHeight;
            $scope.htmlItemStyle.availableArea.visible = true;
            $scope.htmlItemStyle.availableArea.width = iWidth * 0.6;
            $scope.htmlItemStyle.availableArea.height = $scope.htmlItemStyle.availableArea.width * 1.25;
            $scope.htmlItemStyle.availableArea.left = iWidth * 0.21;
            $scope.htmlItemStyle.availableArea.top = iHeight * 0.3;

            if ($scope.aSelectedArtifact.length > 0) {
                $scope.htmlItemStyle.availableArea.styleStr = "visibility:visible;" + 
                "width:" + $scope.htmlItemStyle.availableArea.width + "px;" + 
                "height:" + $scope.htmlItemStyle.availableArea.height + "px;" + 
                "left:" + $scope.htmlItemStyle.availableArea.left + "px;" + 
                "top:" + $scope.htmlItemStyle.availableArea.top + "px;";
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
            console.log('touched!');
            alert("touched");
            //event.gesture.preventDefault();
        };

        $scope.onTap = function($event) {
            console.log('touched!');
            alert("touched");
            //event.gesture.preventDefault();
        };

        $scope.onSelectedArtiItemPinchOut = function($event, oArtifact) {
            console.log('pinch out');
            alert('pinch out');
        };

        $scope.onSelectedArtiItemPinchIn = function($event, oArtifact) {
            console.log('pinch in');
            alert('pinch out');
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
            var oParam = {
                action: 'createCustomDesign',
                fileId: $scope.test.fileId
            };
            var oFileContent = Design.FileManager.create(oParam, function(oContent) {
                $scope.midImgSrc = 'data:image/png;base64,' + oContent.data.midImage64;
                $scope.largeImgSrc = 'data:image/png;base64,' + oContent.data.largeImage64;
            });
        };

        $scope.onBack2DesignDetailClicked = function() {
            $scope.updateDesignToolRow('designDetailView');
            $state.go('^');
        };

        $scope.onOrderBtnClicked = function() {
            $state.go('createDesign.createDetail.orderDesign');
        };

        $scope.onBack2SaveDetailClicked = function() {
            $scope.updateDesignToolRow('designDetailView');
            $state.go('^');
        };

        $scope.onEditAddressDetailClicked = function() {
            $state.go('createDesign.createDetail.addressDetail');
        };

        $scope.onBackFromAddreeDetailClicked = function() {
            $state.go('createDesign.createDetail.orderDesign');
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
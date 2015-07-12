'use strict';

var oManagement = angular.module('ntApp.management', ['ui.router', 'designServices']);

oManagement.config(['$stateProvider', '$httpProvider', function($stateProvider, $httpProvider) {
    $stateProvider.state('management.managePublicArtifact', {
        url: '/publicArtifact',
        // templateUrl: 'views/createDetail.html',
        // controller: 'CreateDetailCtrl'
        views: {
            'managePublicArtifact' : {
                templateUrl: 'views/managePublicArtifact.html',
                controller: function($scope, $state, Design) {
                    $scope.aPublicArtifacts = [];
                    var oParam = {
                        action: 'getPublicArtifactThumbnails'
                    };
                    Design.FileManager.query(oParam, function(oContent) {
                        $scope.aPublicArtifacts = oContent.data;
                    });

                    $scope.onArtifactTypeChange = function(oArtifact, sType) {
                        var oParam = {
                            action: 'updateArtifactType',
                            data: {
                                artifactId: oArtifact._id,
                                type: sType
                            }
                        };
                        Design.DesignManager.update(oParam, function(oData) {
                            if (oData.error || oData.data === 'NOT_FOUND') {
                                $scope.$parent.aMessage.push({
                                    type: 'danger',
                                    content: oData.error || oData.data
                                });
                            } else {
                                oArtifact.type = oData.data.type;
                                $scope.$parent.aMessage.push({
                                    type: 'danger',
                                    content: 'Artifact type changed to ' + oData.data.type + ' successfully.'
                                });
                            }
                        });
                    };

                    $scope.onDeleteArtifact = function(oArtifact) {
                        var oParam = {
                            action: 'deleteArtifact',
                            data: {
                                artifactId: oArtifact._id
                            }
                        };
                        Design.FileManager.delete(oParam, function(oData) {
                            if (oData.error) {
                                $scope.$parent.aMessage.push({
                                    type: 'danger',
                                    content: oData.error || oData.data
                                });
                            } else {
                                var iDeleteIdx = -1;
                                for (var i = 0; i < $scope.aPublicArtifacts.length; i++) {
                                    if ($scope.aPublicArtifacts[i]._id === oArtifact._id) {
                                        iDeleteIdx = i;
                                        break;
                                    }
                                }
                                if (iDeleteIdx > -1) {
                                    $scope.aPublicArtifacts.splice(iDeleteIdx, 1);
                                }
                                $scope.$parent.aMessage.push({
                                    type: 'danger',
                                    content: 'Artifact ' + oArtifact._id + ' deleted successfully.'
                                });
                            }
                        });
                    };

                    $scope.onOrder2TopClicked = function(oArtifact) {
                        var oParam = {
                            action: 'updateArtifactModifiedTime',
                            data: {
                                artifactId: oArtifact._id
                            }
                        };
                        Design.DesignManager.update(oParam, function(oData) {
                            if (oData.error || oData.data === 'NOT_FOUND') {
                                $scope.$parent.aMessage.push({
                                    type: 'danger',
                                    content: oData.error || oData.data
                                });
                            } else {
                                oArtifact.type = oData.data.type;
                                $scope.$parent.aMessage.push({
                                    type: 'danger',
                                    content: 'Artifact lastModified time changed successfully.'
                                });
                            }
                        });
                    };
                }
            }
        }
    })
    .state('management.managePublicDesign', {
        url: '/publicDesign',
        views: {
            'managePublicDesign' : {
                templateUrl: 'views/managePublicDesign.html',
                controller: function($scope, $state, Design) {
                    $scope.filterTypeText = 'review';
                    $scope.aUnderReviewDesigns = [];
                    var oParam = {
                        action: 'getReviewDesigns',
                        access: 'review'
                    };
                    Design.DesignManager.query(oParam, function(oContent) {
                        $scope.aUnderReviewDesigns = oContent.designList;
                    });

                    $scope.onDesignAccessChange = function(oDesign, sTargetAccess) {
                        var oUpdateParam = {
                            action: 'updateDesignAccess',
                            data: {
                                designId: oDesign._id,
                                access: sTargetAccess
                            }
                        };
                        Design.DesignManager.update(oUpdateParam, function(oData) {
                            if (oData.error) {
                                $scope.$parent.aMessage.push({
                                    type: 'danger',
                                    content: oData.error || oData.data
                                });
                            } else {
                                oDesign.access = oData.data.access;
                                $scope.$parent.aMessage.push({
                                    type: 'danger',
                                    content: 'Design ' + oDesign._id + ' access updated to ' + oDesign.access + ' successfully.'
                                });
                            }
                        });
                    };

                    $scope.onDesign2TopClicked = function(oDesign) {
                        var oUpdateParam = {
                            action: 'updateDesignLastModified',
                            data: {
                                designId: oDesign._id
                            }
                        };
                        Design.DesignManager.update(oUpdateParam, function(oData) {
                            if (oData.error) {
                                $scope.$parent.aMessage.push({
                                    type: 'danger',
                                    content: oData.error || oData.data
                                });
                            } else {
                                oDesign.access = oData.data.access;
                                $scope.$parent.aMessage.push({
                                    type: 'danger',
                                    content: 'Design last modified time changed successfully.'
                                });
                            }
                        });
                    };

                    $scope.onDesignFilterChange = function(sTargetFilter) {
                        $scope.filterTypeText = sTargetFilter;
                        var oParam = {
                            action: 'getReviewDesigns',
                            access: sTargetFilter
                        };
                        Design.DesignManager.query(oParam, function(oContent) {
                            $scope.aUnderReviewDesigns = oContent.designList;
                        });
                    };
                }
            }
        }
    });
}]);

oManagement.controller('ManagementControl', ['$scope', '$stateParams', '$state', '$modal', '$upload', 'Design', 'UIData', 
    function($scope, $stateParams, $state, $modal, $upload, Design, UIData) {
        var oAppData = UIData.getAppData();
        if (oAppData.TESTING) {
            $scope.hostName = 'http://localhost:10001';
        } else {
            $scope.hostName = 'http://www.weavesfun.com';
        }

        $scope.sortTypeText = '已付款';
        $scope.aMessage = [];

        var oParam = {
            action: 'getOrders',
            type: 'paid'
        }
        Design.DesignManager.query(oParam, function(oData) {
            $scope.handleOrderListCallback(oData);
        });

        $scope.handleOrderListCallback = function(oData) {
            $scope.aOrders = oData.data;
            for (var i = 0; i < $scope.aOrders.length; i++) {
                var oItem = $scope.aOrders[i];
                oItem.mailAddressString = '';
                oItem.mailAddressString  += oItem.province + ' ';
                oItem.mailAddressString  += oItem.city + ' ';
                oItem.mailAddressString  += oItem.district + ' ';
                oItem.mailAddressString  += oItem.postCode + ' ';
                oItem.mailAddressString  += oItem.detailAddress;

                oItem.originExpressInfo = oItem.expressInfo;

                var oInfo = JSON.parse(oItem.info);
                var sColor = oInfo.color;
                var iMaleCount = parseInt(oItem.maleQuantity);
                var iFemaleCount = parseInt(oItem.femaleQuantity);
                oItem.sizeCount = '';
                if (iMaleCount > 0) {
                    oItem.sizeCount += '男士 ';
                    oItem.sizeCount += oItem.maleSize + '号 ';
                    oItem.sizeCount += iMaleCount + '件';
                    if (sColor === 'white') {
                        oItem.sizeCount += '白色 ';
                        oItem.bkImg = 'img/male_white.png';
                    } else {
                        oItem.sizeCount += '黑色 ';
                        oItem.bkImg = 'img/male_black.png';
                    }
                }
                if (iFemaleCount > 0) {
                    oItem.sizeCount += '女士 ';
                    oItem.sizeCount += oItem.femaleSize + '号 ';
                    oItem.sizeCount += iFemaleCount + '件';
                    if (sColor === 'white') {
                        oItem.sizeCount += '白色 ';
                        oItem.bkImg = 'img/female_white.png';
                    } else {
                        oItem.sizeCount += '黑色 ';
                        oItem.bkImg = 'img/female_black.png';
                    }
                }

                var oCenterDom = $('.headerRow > div:first-child')[0];
                if (oCenterDom) {
                    var iWidth = oCenterDom.clientWidth;
                    var iHeight = iWidth * 1021 / 642;
                    var iLeft = iWidth * 0.21;
                    var iTop = iHeight * 0.22;
                    var iDesignImageWidth = iWidth * 0.6;

                    oItem.previewImagePosition = "left:" + iLeft + "px;" + 
                        "top:" + iTop + "px;" + 
                        "width:" + iDesignImageWidth + "px;";
                }
            };
        };

        $scope.downloadDesignFile = function(oOrder) {
            var sDesignFileId = oOrder.designId.designFileId;
            var oParam = {
                action: 'downloadDesignFile',
                designFileId: sDesignFileId
            };

            var iframeId = "download_iframe";
            var iframe = document.getElementById(iframeId);
            if (!iframe) {
                iframe = document.createElement("iframe");
                iframe.id = iframeId;
                iframe.setAttribute("style", "display:none;");
                $(document.body).append(iframe);
            }
            iframe.src = '/file?action=downloadDesignFile&designFileId=' + sDesignFileId;

            // Design.FileManager.query(oParam, function(oData) {
            //     var blob=new Blob([oData]);
            //     var link=document.createElement('a');
            //     link.href=window.URL.createObjectURL(blob);
            //     link.download="myFileName.png";
            //     link.click();
            // });
        };

        $scope.onOrderStatusChange = function(oOrder, sNewStatus) {
            if (oOrder.targetStatus !== sNewStatus) {
                oOrder.targetStatus = sNewStatus;
            }
        };

        $scope.onUpdateOrderStatusClicked = function(oOrder) {
            if ((!!oOrder.targetStatus && oOrder.targetStatus !== oOrder.status) || 
                (oOrder.expressInfo !== oOrder.originExpressInfo)) {
                var oParam = {
                    action: 'updateOrderStatus',
                    data: {
                        orderId: oOrder._id
                    }
                };

                var bUpdateStatus = false;
                var bUpdateExpressInfo = false;

                if (!!oOrder.targetStatus && oOrder.targetStatus !== oOrder.status) {
                    oParam.data.targetStatus = oOrder.targetStatus;
                    bUpdateStatus = true;
                }
                if (oOrder.expressInfo !== oOrder.originExpressInfo) {
                    oParam.data.expressInfo = oOrder.expressInfo;
                    bUpdateExpressInfo = true;
                }

                Design.DesignManager.update(oParam, function(oData) {
                    if (oData.error) {
                        alert(oData.error);
                    } else {
                        oOrder.status = oData.data.status;

                        if (bUpdateStatus) {
                            $scope.aMessage.push({
                                type: 'danger',
                                content: 'Order status updated to ' + oOrder.status
                            });
                        }

                        if (bUpdateExpressInfo) {
                            $scope.aMessage.push({
                                type: 'danger',
                                content: 'Order 快递信息更新为：' + oOrder.expressInfo
                            });
                        }

                        oOrder.lastModified = oData.data.lastModified;
                    }
                });
            }
        };

        $scope.onSortTypeChange = function(sSortType) {
            var oParam = {
                action: 'getOrders',
                type: 'all'
            }
            if (sSortType === 'all') {
                oParam.type = 'all';
                $scope.sortTypeText = '全部';
            } else if (sSortType === 'paid') {
                oParam.type = 'paid';
                $scope.sortTypeText = '已付款';
            } else if (sSortType === 'shipped') {
                oParam.type = 'shipped';
                $scope.sortTypeText = '已发货';
            } else {
                oParam.type = 'all';
                $scope.sortTypeText = '全部';
            }

            Design.DesignManager.query(oParam, function(oData) {
                $scope.handleOrderListCallback(oData);
            });
        };

        $scope.fileSelected = function(aFile) {
            if (aFile && aFile.length > 0) {
                $scope.open();

                for (var i = 0; i < aFile.length; i++) {
                    var file = aFile[i];
                    var sFileName = file.name;
                    $upload.upload({
                        method: 'POST',
                        url: 'uploadFile',
                        file: file,
                        data : {
                            'action': 'uploadFile',
                            'fileName': sFileName,
                            'access': 'public'
                        }
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        $scope.uploadDialogData.uploadProgress = progressPercentage;
                        console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                    }).success(function (oData, status, headers, config) {
                        //console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                        

                        $scope.uploadDialogData.cancel($scope.modalInstance);//Close upload progress dialog
                        $scope.uploadDialogData = null;

                        if (oData.status === 'OK') {
                            $scope.aMessage.push({
                                type: 'danger',
                                content: '公共素材 ' + sFileName + ' 上传成功！'
                            });
                        }
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

        $scope.onManagePublicArtifactClicked = function() {
            $state.go('management.managePublicArtifact');
        };

        $scope.onManagePublicDesignClicked = function() {
            $state.go('management.managePublicDesign');
        };

        $scope.closeAlert = function(index) {
            $scope.aMessage.splice(index, 1);
        };
    }

]);
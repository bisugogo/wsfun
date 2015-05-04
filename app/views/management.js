'use strict';

var oManagement = angular.module('ntApp.management', ['ui.router', 'designServices']);

oManagement.config(['$stateProvider', '$httpProvider', function($stateProvider, $httpProvider) {

}]);

oManagement.controller('ManagementControl', ['$scope', '$stateParams', '$state', '$modal', '$upload', 'Design', 
    function($scope, $stateParams, $state, $modal, $upload, Design) {
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

                var iMaleCount = parseInt(oItem.maleQuantity);
                var iFemaleCount = parseInt(oItem.femaleQuantity);
                oItem.sizeCount = '';
                if (iMaleCount > 0) {
                    oItem.sizeCount += '男士 ';
                    oItem.sizeCount += oItem.maleSize + '号 ';
                    oItem.sizeCount += iMaleCount + '件';
                }
                if (iFemaleCount > 0) {
                    oItem.sizeCount += '女士 ';
                    oItem.sizeCount += oItem.femaleSize + '号 ';
                    oItem.sizeCount += iFemaleCount + '件';
                }

                var oCenterDom = $('.headerRow > div:first-child')[0];
                if (oCenterDom) {
                    var iWidth = oCenterDom.clientWidth;
                    var iHeight = iWidth * 1021 / 642;
                    var iLeft = iWidth * 0.21;
                    var iTop = iHeight * 0.3;
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
            if (!!oOrder.targetStatus && oOrder.targetStatus !== oOrder.status) {
                var oParam = {
                    action: 'updateOrderStatus',
                    data: {
                        orderId: oOrder._id,
                        targetStatus: oOrder.targetStatus
                    }
                };
                Design.DesignManager.update(oParam, function(oData) {
                    if (oData.error) {
                        alert(oData.error);
                    } else {
                        oOrder.status = oData.data.status;
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
                                content: '公共素材上传成功！'
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

        $scope.closeAlert = function(index) {
            $scope.aMessage.splice(index, 1);
        };
    }

]);
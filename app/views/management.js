'use strict';

var oManagement = angular.module('ntApp.management', ['ui.router', 'designServices']);

oManagement.config(['$stateProvider', '$httpProvider', function($stateProvider, $httpProvider) {

}]);

oManagement.controller('ManagementControl', ['$scope', '$stateParams', '$state', 'Design', 
    function($scope, $stateParams, $state, Design) {
        var oParam = {
            action: 'getOrders',
            type: 'all'
        }
        Design.DesignManager.query(oParam, function(oData) {
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
            };
        });

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
    }

]);
var payOrder = angular.module('ntApp.payOrder', [
    'ui.router', 
    'uiDataServices',
    'angular-md5'
]);

// orderList.config(['$stateProvider', function($stateProvider) {
//     $stateProvider.state('myDesigns', {
//         url: '/myDesigns',
//         templateUrl: 'views/myDesigns.html',
//         controller: 'MyDesignsListCtrl'
//     });
// }]);

payOrder.controller('PayOrderCtrl', ['$scope', '$state', 'md5', 'Auth', 'UIData', function($scope, $state, md5, Auth, UIData) {
    var oAppInfo = UIData.getAppData();

    //Regist Wechat Interface
    var oParam = {
        action: 'getJsAPISignature'
    };
    
    var oSig = Auth.AuthManager.query(oParam, function () {
        console.log(oSig.signature);
        wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: oAppInfo.APP_ID, // 必填，公众号的唯一标识
            timestamp: oSig.timestamp, // 必填，生成签名的时间戳
            nonceStr: oSig.nonceStr, // 必填，生成签名的随机串
            signature: oSig.signature,// 必填，签名，见附录1
            jsApiList: ["chooseWXPay"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });

        wx.ready(function() {
            console.log('js sdk configuration set up successfully.');
        });

        wx.error(function(res){
            console.log('js sdk configuration set up failed!!!');
        });
    });

    $scope.designCount = UIData.getData('designCount');

    $scope.onPayClicked = function() {
        var oAuthParam = {
            action: 'createPreOrder',
            //wechatId: $scope.test.larry.openId
        };
        Auth.AuthManager.update(oAuthParam, function(oData) {
            //$scope.test.larry._id = oData.data._id;
            console.log(oData);
            if (oData.data.result_code === 'SUCCESS' && 
                oData.data.return_code === 'SUCCESS' && 
                oData.data.return_msg === 'OK') {
                $scope.sendPayRequest(oData.data);
            }
        });
    };

    $scope.sendPayRequest = function(oData) {
        var sAppId = oAppInfo.APP_ID;
        var sTimestamp = new Date().getTime();
        var sNonceStr = oData.nonce_str;
        var sPackage = oData.prepay_id;
        var sSignType = 'MD5';

        var sAppIdKeyValue = 'appId=' + sAppId;
        var sTimestampKeyValue = 'timeStamp=' + sTimestamp;
        var sNonceStrKeyValue = 'nonceStr=' + sNonceStr;
        var sPackageKeyValue = 'package=' + sPackage;
        var sSignTypeKeyValue = 'signType=' + sSignType;

        var aStr = [sAppIdKeyValue, sTimestampKeyValue, sNonceStrKeyValue, sPackageKeyValue, sSignTypeKeyValue];
        aStr.sort();
        var sTempStr = aStr.join('&');
        var sSign = md5.createHash(sTempStr).toUpperCase();

        wx.chooseWXPay({
            timestamp: sTimestamp,
            nonceStr: sNonceStr,
            'package': sPackage,
            signType: sSignType,
            paySign: sSign,
            success: function(res) {
                var i = 0;
            }
        });
    };
}]);
var wechatServices = angular.module('wechatServices', ['ngResource']);

wechatServices.factory('Auth', ['$resource',
    function($resource){
        //var oGetParam = {};

        // function getPreparedGetParam() {
        //     return oGetParam;
        // }

        return {
            // getGetParam: function(){
            //     return oGetParam;
            // },

            // setGetParam: function(oParam){
            //     oGetParam = oParam;
            // },

            AuthManager: $resource('https://api.weixin.qq.com/sns/oauth2/access_token', {}, {
                query: {method:'GET'}/*, params: getPreparedGetParam()},*/
                // create: {method:'POST'},
                // delete: {method: 'POST'}
            })
        };
}]);
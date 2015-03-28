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

            AuthManager: $resource('security', {}, {
                query: {method:'GET'}/*, params: getPreparedGetParam()},*/
                // create: {method:'POST'},
                // delete: {method: 'POST'}
            })
        };
}]);
var oUIDataServices = angular.module('uiDataServices', []);

oUIDataServices.factory('UIData', [
    function(){
        //var oGetParam = {};

        // function getPreparedGetParam() {
        //     return oGetParam;
        // }
        var oUIData = {};
        var oAPPData = {
            APP_ID : 'wxf26855bd0cda23bd',
            BIZ_ID : '1232336702',
            TESTING: true,
            LAZY_LOAD_SIZE: 6
        };

        var oQuerySent = {
            userInfo: false,
            designList: false,
            orderList: false
        };

        return {
            // getGetParam: function(){
            //     return oGetParam;
            // },

            // setGetParam: function(oParam){
            //     oGetParam = oParam;
            // },

            setData: function(key, value) {
                oUIData[key] = value;
            },

            getData: function(key) {
                var oRet = oUIData[key];
                if (!oRet) {
                    return null;
                } else {
                    return oRet;
                }
                //return oUIData[key];
            },

            getAppData: function() {
                return oAPPData;
            },

            getQuerySentData: function(sKey) {
                return oQuerySent[sKey];
            },

            setQuerySentData: function(sKey, oValue) {
                oQuerySent[sKey] = oValue;
            }
        };
}]);
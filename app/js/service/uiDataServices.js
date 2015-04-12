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
            BIZ_ID : '1232336702'
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
                return oUIData[key];
            },

            getAppData: function() {
                return oAPPData;
            }
        };
}]);
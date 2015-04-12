var oUIDataServices = angular.module('uiDataServices', []);

oUIDataServices.factory('UIData', [
    function(){
        //var oGetParam = {};

        // function getPreparedGetParam() {
        //     return oGetParam;
        // }
        var oUIData = {};

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
            }
        };
}]);
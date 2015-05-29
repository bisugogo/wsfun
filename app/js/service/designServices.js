var designServices = angular.module('designServices', ['ngResource']);

designServices.factory('Design', ['$resource',
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

            DesignManager: $resource('tshirt', {}, {
                query: {method:'GET', /*params: getPreparedGetParam(), */},
                create: {method:'POST'},
                update: {method: 'POST'},
                delete: {method: 'POST'}
            }),
            
            FileManager: $resource('file', {}, {
                query: {method:'GET', /*headers: {'Accept-Encoding': 'gzip'}*/},
                create: {method:'POST'},
                delete: {method: 'POST'}
            })
        };
}]);
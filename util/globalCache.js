var __cache = {};

exports.cache = (function() {
    var o = new Object();
    /**
    * 添加一个新缓存
    * @param key 缓存名
    * @param value 缓存值
    * @param haomiao 缓存时间 毫秒如果不加时间默认1分钟。
    */
    o.upsertCache = function(key, value){
        // var haom = haomiao?haomiao:60000;
        __cache[key] = value;
        // setTimeout(function(){ //使用TIMEOUT来处理超时时的删除。
        //     delete __cache[tcache];
        // },haom);
    };

    o.getCache = function(key)
    {
        return __cache[key];
    };

    /**
    * 删除缓存
    * @param key 删除的缓存名称
    */
    o.delCache = function(key)
    {
        delete __cache[key];
    };
    //console.log(o);
    return o;
})();
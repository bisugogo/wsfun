var DesignImageManager = function() {};

DesignImageManager.prototype.getWechatEvent = function() {
    var oRet = {
        MsgType: 'event',
        FromUserName: 'user1',
        Event: 'unsubscribe',
        Content: 'content text'
    };
    return oRet;
};

module.exports.DesignImageManager = DesignImageManager; 
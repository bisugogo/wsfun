var FakeDataManager = function() {};

FakeDataManager.prototype.getWechatEvent = function() {
    var oRet = {
        MsgType: 'event',
        FromUserName: 'user1',
        Event: 'unsubscribe',
        Content: 'content text'
    };
    return oRet;
};

module.exports.FakeDataManager = FakeDataManager;
function WeChatManager () {

}

WeChatManager.prototype.doAction = function(req, res) {
    var sMsg = req.weixin;
    console.log(sMsg);
};
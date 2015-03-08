function WeChatManager () {

}

WeChatManager.prototype.doAction = function(req, res) {
    var oMsg = req.weixin;
    console.log('User OpenId: ' + oMsg.FromUserName);
    console.log('User text: ' + oMsg.Content);
    res.reply('Weaves Fun!! We are better with you!');
};
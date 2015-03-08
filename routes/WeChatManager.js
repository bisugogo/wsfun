var User = require('../models/User.js');

var WeChatManager = function() {};

WeChatManager.prototype.doAction = function(req, res) {
    var oMsg = req.weixin;
    console.log('User OpenId: ' + oMsg.FromUserName);
    console.log('User text: ' + oMsg.Content);

    var sMsgType = oMsg.MsgType;
    if (sMsgType === 'event') {
        this.doEvent(sMsgType, req, res);
    } else {
        res.reply('Weaves Fun!! We are better with you!');
    }
};

WeChatManager.prototype.doEvent = function(sType, req, res) {
    var oMsg = req.weixin;
    var sWechatId = oMsg.FromUserName;
    if (sType === 'subscribe') {
        User.find({wechatId: sWechatId}, function(err, oUser) {

            if(!oUser) {
                var oNewUser = new User({
                    wechatId: sWechatId
                });

                oNewUser.save(function(err) {
                    if(err) {
                        console.log('Error while saving user: ' + err);
                        return;
                    } else {
                        console.log("User created");
                        return;
                    }
                });
            }

            if(!err) {
                res.reply('您已经关注了 微服私纺');
                return;
            } else {
                console.log('Internal error(%d): %s', res.statusCode, err.message);
                return;
                //return res.send({ error: 'Server error' });
            }
        });

        res.reply('感谢您关注 微服私纺');
        return;
    } else if (sType === 'unsubscribe') {
        console.log('Users: ' + sWechatId + ' has unsubscribed us!');
        return;
    } else {
        res.reply('Event not supported yet.');
        return;
    }
};

module.exports.WeChatManager = WeChatManager;

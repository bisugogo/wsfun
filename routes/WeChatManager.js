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
                        // res.send({ error:err });
                        // return;

                    } else {

                        console.log("User created");
                        //return res.send({ status: 'OK', tshirt:design });

                    }

                });
            }

            if(!err) {
                res.reply('您已经关注了 微服私纺');
            } else {
                console.log('Internal error(%d): %s', res.statusCode, err.message);
                //return res.send({ error: 'Server error' });
            }
        });

        res.reply('感谢您关注 微服私纺');
    } else if (sType === 'unsubscribe') {
        console.log('Users: ' + sWechatId + ' has unsubscribed us!');
    } else {
        res.reply('Event not supported yet.');
    }
};

module.exports.WeChatManager = WeChatManager;

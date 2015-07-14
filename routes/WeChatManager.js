var User = require('../models/User.js');

var WeChatManager = function() {};

WeChatManager.prototype.doAction = function(req, res) {
    var oMsg = req.weixin;
    console.log('User OpenId: ' + oMsg.FromUserName);
    console.log('User text: ' + oMsg.Content);

    var sMsgType = oMsg.MsgType;
    if (sMsgType === 'event') {
        this.doEvent(req, res);
    } else {
        this.doMessage(req, res);
        //res.reply('Weaves Fun!! We are better with you!');
    }
};

WeChatManager.prototype.doEvent = function(req, res) {
    var oMsg = req.weixin;
    var sWechatId = oMsg.FromUserName;
    var sEventType = oMsg.Event;
    if (sEventType === 'subscribe') {
        User.findOne({wechatId: sWechatId}, function(err, oUser) {

            if(!oUser) {
                console.log('no existing user found');
                var oNewUser = new User({
                    wechatId: sWechatId,
                    status: 1,
                    type: 'subscriber'
                });

                oNewUser.save(function(err) {
                    if(err) {
                        console.log('Error while saving user: ' + err);
                        return;
                    } else {
                        console.log("User created");
                        res.reply('感谢您关注 微服私纺');
                        return;
                    }
                });
            } else {
                if (oUser.type !== 'subscriber') {
                    oUser.type = 'subscriber';
                    oUser.save(function(err) {
                        if(err) {
                            console.log('Error while saving user: ' + err);
                            return;
                        } else {
                            console.log("User created");
                            res.reply('感谢您关注 微服私纺');
                            return;
                        }
                    });
                } else {
                    console.log('existing user found');
                    res.reply('您已经关注了 微服私纺');
                    return;
                }
            }

            // if(!err) {
            //     console.log('existing user found');
            //     res.reply('您已经关注了 微服私纺');
            //     return;
            // } else {
            //     console.log('Internal error(%d): %s', res.statusCode, err.message);
            //     return;
            //     //return res.send({ error: 'Server error' });
            // }
        });
        return;
    } else if (sEventType === 'unsubscribe') {
        console.log('Users: ' + sWechatId + ' has unsubscribed us!');
        User.findOneAndUpdate({wechatId: sWechatId}, 
            {
                status: 1,
                type: 'tourist'
            }, 
            {upsert:true}, function(err) {
            if(err) {
                console.log('Error while updating user status: ' + err);
                //return;
            } else {
                console.log("User status updated");
                //return;
            }
            res.reply('');
        })
        return;
    } else {
        res.reply('Event not supported yet.');
        return;
    }
};

WeChatManager.prototype.doMessage = function(req, res) {
    var oMsg = req.weixin;
    var sWechatId = oMsg.FromUserName;
    var sEventType = oMsg.Event;
    res.reply({
        type: 'transfer_customer_service'
    });
};

module.exports.WeChatManager = WeChatManager;

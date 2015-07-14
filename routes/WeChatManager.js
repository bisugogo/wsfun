var User = require('../models/User.js');

var WeChatManager = function() {};

var welcomeMsg = '小主，\n您回来啦～[愉快]\n夏天这么热，正是小主挥洒身姿的好光景啊～～\n\n';
welcomeMsg += '内务府近期刚从西域进购了一批上等的全棉衣料，赶快再来定制一件屌炸天的私人新T恤吧。\n\n';
welcomeMsg += '请点击：\n【新设计】 开始设计自己的专属T恤\n【设计精选】 查看其他设计师作品\n\n';
welcomeMsg += '您也可以点击 【关于微服】 了解关于我们更详细的资料。或直接回复“客服”来联系我们的客服人员。\n\n';
welcomeMsg += '再次感谢您的关注～～[愉快][爱心][拥抱]';

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
                        res.reply(welcomeMsg);
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
                            res.reply(welcomeMsg);
                            return;
                        }
                    });
                } else {
                    console.log('existing user found');
                    res.reply(welcomeMsg);
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

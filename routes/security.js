/**
 * Security
 *
 * @module      :: Routes
 * @description :: Maps routes and actions
 */

var https = require('https');
var User = require('../models/User.js');
var Cache = require('../util/globalCache.js').cache;
var crypto = require('crypto');

var APP_ID = 'wxf26855bd0cda23bd';
var SECRET = '498e6f493c29733d46e212c441f505e8';

module.exports = function(app) {
    updateJsAPITicket = function() {
        var oCachedAccessToken = Cache.getCache('ACCESS_TOKEN');
        if (!oCachedAccessToken) {
            console.log('No cached ACCESS_TOKEN exists, cannot update js API signature.');
            return;
        } else {
            var tokenValue = oCachedAccessToken.tokenValue;
            https.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + tokenValue + '&type=jsapi', function(weChatRes) {
                console.log('STATUS: ' + weChatRes.statusCode);
                console.log('HEADERS: ' + JSON.stringify(weChatRes.headers));
                weChatRes.setEncoding('utf8');
                weChatRes.on('data', function (chunk) {
                    console.log('BODY: ' + chunk);
                    var oRes = JSON.parse(chunk);
                    console.log('ticket: ' + oRes.ticket);
                    Cache.upsertCache('JS_API_TICKET', {
                        ticketValue: oRes.ticket,
                        ticketTimestamp: new Date().getTime(),
                        expiresIn: oRes.expires_in
                    });
                });
            });
        }
        
    };

    updateAccessToken = function() {
        https.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + APP_ID +
            '&secret=' + SECRET, function(weChatRes) {
                console.log('STATUS: ' + weChatRes.statusCode);
                console.log('HEADERS: ' + JSON.stringify(weChatRes.headers));
                weChatRes.setEncoding('utf8');
                weChatRes.on('data', function (chunk) {
                    console.log('BODY: ' + chunk);
                    var oRes = JSON.parse(chunk);
                    console.log('access_token: ' + oRes.access_token);
                    Cache.upsertCache('ACCESS_TOKEN', {
                        tokenValue: oRes.access_token,
                        tokenTimestamp: new Date().getTime(),
                        expiresIn: oRes.expires_in
                    });

                    updateJsAPITicket();
                });
            }
        );
    };

    getWechatUserOpenId = function(sCode, res) {
        https.get('https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + APP_ID +
            '&secret=' + SECRET +
            '&code=' + sCode + '&grant_type=authorization_code', function(weChatRes) {
                console.log('STATUS: ' + weChatRes.statusCode);
                console.log('HEADERS: ' + JSON.stringify(weChatRes.headers));
                weChatRes.setEncoding('utf8');
                weChatRes.on('data', function (chunk) {
                    console.log('BODY: ' + chunk);
                    res.send(chunk);
                });
            }
        );
    };

    getJsAPITicket= function() {
        var oJsAPITicket = Cache.getCache('JS_API_TICKET');
        if (!oJsAPITicket) {
            console.log('No cached js api signature found!');
            return null;
        } else {
            return oJsAPITicket;
        }
    };

    getJsAPISignature = function(req, res) {
        var oJsAPITicket = getJsAPITicket();
        console.log("**************");
        console.log('cached ticket: ' + oJsAPITicket.ticketValue);
        console.log("**************");
        if (!!oJsAPITicket) {
            //var sPage = req.query.page;
            var sNonce = 'asdfasdfasdf';
            var sNonceStr = 'noncestr=' + sNonce;
            var sTimestampStr = 'timestamp=' + oJsAPITicket.ticketTimestamp;
            var sUrlStr = 'url=http://design.weavesfun.com/';
            var sTicketStr = 'jsapi_ticket=' + oJsAPITicket.ticketValue;

            var shasum = crypto.createHash('sha1');

            var aStr = [sTicketStr, sNonceStr, sTimestampStr, sUrlStr];
            var sTobeSignatured = aStr.join('&');
            console.log('sorted string to be signatureed' + sTobeSignatured);
            shasum.update(sTobeSignatured);
            var sTargetSig = shasum.digest('hex');
            
            var oRet = {
                timestamp: oJsAPITicket.ticketTimestamp,
                nonceStr: sNonce,
                signature: sTargetSig
            };
            res.send(oRet);
        } else {
            res.send({
              error: 'No JS API ticket available on server.'
            });
        }
    };

    registAuth = function(oData, res) {
        https.get('https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + APP_ID + '&redirect_uri=' + 
            encodeURIComponent('http://design.weavesfun.com/#/createDesign') + 
            '&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect', function(weChatRes) {
                console.log('STATUS: ' + weChatRes.statusCode);
                console.log('HEADERS: ' + JSON.stringify(weChatRes.headers));
                // weChatRes.setEncoding('utf8');
                // weChatRes.on('data', function (chunk) {
                //     console.log('BODY: ' + chunk);
                //     res.send(chunk);
                // });
                res.send({data: 'OK'})
            }
        );
    };

    getUserIdByWechatId = function(sWechatId, res) {
        var oQuery = User.findOne({wechatId: sWechatId});
        oQuery.select('_id');
        oQuery.exec(function (err, oUser) {
            if (err) {
                res.send({error: err.message});
            } else {
                var oRet = {
                    data: oUser
                }
                res.send(oRet);
            }
        });
    };

    getService = function(req, res) {
        var sAction = req.query.action;
        if (sAction === 'getWechatUserOpenId') {
            var sCode = req.query.code;
            console.log("********************");
            console.log("security get service: getWechatUserOpenId");
            console.log("code: " + sCode);
            console.log("********************");

            getWechatUserOpenId(sCode, res);
        } else if (sAction === 'getJsAPISignature') {
            getJsAPISignature(req, res);
        } else if (sAction === 'getUserIdByWechatId') {
            var sWechatId = req.query.wechatId;
            getUserIdByWechatId(sWechatId, res);
        } else {
            console.log("********************");
            console.log("security get service: not supported action");
            console.log("********************");
        }
    };

    postService = function (req, res) {
        var sAction = req.body.action;
        if (sAction && sAction !== '') {
            if (sAction === 'registAuth') {
                registAuth(req.body.data, res);
            }
        }
    };

    //Link routes and actions
    app.get('/security', getService);
    app.post('/security', postService);
};
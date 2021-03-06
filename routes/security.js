/**
 * Security
 *
 * @module      :: Routes
 * @description :: Maps routes and actions
 */

var https = require('https');
var xmlLite = require("node-xml-lite");
var Order = require('../models/order.js');
var User = require('../models/User.js');
var Cache = require('../util/globalCache.js').cache;
var crypto = require('crypto');
var LOG = require('../util/wsLog');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var APP_ID = 'wxf26855bd0cda23bd';
var SECRET = '498e6f493c29733d46e212c441f505e8';
var BIZ_ID = '1232336702';
var API_KEY = 'ENt2aaBmTQdaBki2Qwcjm4Fp2A6dREkB';
var LARRY_OPEN_ID = 'oMOsBtzA2Kbns3Dulc2s6upB5ZBw';
var TEMP_TRADE_ID = new Date().getTime().toString();

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
                    var oAuthReturn = JSON.parse(chunk);
                    console.log('BODY_OPENID: ' + oAuthReturn.openid);

                    if (chunk.errcode || chunk.errmsg) {
                        LOG.logger.logFunc('getWechatUserOpenId', 'Wechat OAUTH failed.');
                        res.send({
                            error: 'Wechat OAUTH failed.'
                        });
                        return;
                    }

                    var oQuery = User.findOne({wechatId: oAuthReturn.openid});
                    oQuery.exec(function (err, oUser) {
                        if (err) {
                            res.send({error: err.message});
                        } else {
                            if (!oUser) {
                                //This is a new user
                                var oNewUserJson = {
                                    _id: new ObjectId(),
                                    wechatId: oAuthReturn.openid,
                                    status: 1,
                                    type: 'tourist'
                                };
                                var oNewUser = new User(oNewUserJson);
                                oNewUser.save(function(err, oDBRet) {
                                    if (err) {
                                        LOG.logger.logFunc('getWechatUserOpenId', 'save new user failed.' + err.message);
                                        res.send({
                                            error: 'New user. Failed to save user.'
                                        });
                                    } else {
                                        oNewUserJson.userId = oDBRet._doc._id;
                                        LOG.logger.logFunc('getWechatUserOpenId', 'save new user successfully ' + oNewUserJson);
                                        res.send({
                                            status: 'OK',
                                            data: oNewUserJson
                                        });
                                    }
                                });
                            } else {
                                //This is an old user
                                oUser.userId = oUser._id;
                                LOG.logger.logFunc('getWechatUserOpenId', 'get old user successfully ' + oUser);
                                res.send({
                                    status: 'OK',
                                    data: oUser
                                });
                            }
                        }
                    });

                    //res.send(chunk);
                });
            }
        );
    };

    getTestUserOpenId = function(sUserId, res) {
        var oQuery = User.findById({
            _id: sUserId
        });
        oQuery.exec(function(err, oUser) {
            if (err) {
                LOG.logger.logFunc('getTestUserOpenId ', err.message);
                res.send({
                    error: 'getTestUserOpenId ' + err.message
                });
            } else {
                LOG.logger.logFunc('getTestUserOpenId ', ' get test user info successfully');
                res.send({
                    status: 'OK',
                    data: oUser
                });
            }
        });
    };

    getJsAPITicket = function() {
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

    createPreOrder = function(req, res) {
        var oData = req.body.data;
        var sRemoteIP = getClientIp(req);
        LOG.logger.logFunc('createPreOrder', 'remote IP: ' + sRemoteIP);

        var sAppId = APP_ID;
        var sAttach = oData.preOrderAttach;
        var sBody = oData.preOrderBody;
        var sMchId = BIZ_ID;
        var sNonceStr = createRandomString(32);
        var sNotifyUrl = 'http://design.weavesfun.com/security';

        var sOpenId = oData.userOpenId;
        LOG.logger.logFunc('createPreOrder', 'user openid: ' + sOpenId);

        var sOutTradeNo = oData.preOrderOutTradeNo;
        var sSpBillCreateIp = sRemoteIP;
        var sTotalFee = oData.preOrderTotalFee * 100;
        //var sTotalFee = 1;
        var sTradeType = 'JSAPI';

        var sAppIdKeyValue = 'appid=' + sAppId;
        var sAttachKeyValue = 'attach=' + sAttach;
        var sBodyKeyValue = 'body=' + sBody;
        var sMchIdKeyValue = 'mch_id=' + sMchId;
        var sNonceStrKeyValue = 'nonce_str=' + sNonceStr;
        var sNotifyUrlKeyValue = 'notify_url=' + sNotifyUrl;
        var sOpenIdKeyValue = 'openid=' + sOpenId;
        var sOutTradeNoKeyValue = 'out_trade_no=' + sOutTradeNo;
        var sSpBillCreateIpKeyValue = 'spbill_create_ip=' + sSpBillCreateIp;
        var sTotalFeeKeyValue = 'total_fee=' + sTotalFee;
        var sTradeTypeKeyValue = 'trade_type=' + sTradeType;

        var md5sum = crypto.createHash('md5');
        var aStr = [sAppIdKeyValue, sAttachKeyValue, sBodyKeyValue, sMchIdKeyValue, sNonceStrKeyValue, 
            sNotifyUrlKeyValue, sOpenIdKeyValue, sOutTradeNoKeyValue, sSpBillCreateIpKeyValue, sTotalFeeKeyValue, 
            sTradeTypeKeyValue];

        aStr.sort();
        //console.log(aStr.toString());
        var sTempKeyValue = aStr.join('&');
        sTempKeyValue += '&key=' + API_KEY;

        LOG.logger.logFunc('createPreOrder', 'sTempKeyValue: ' + sTempKeyValue);

        md5sum.update(sTempKeyValue);
        var sTargetSig = md5sum.digest('hex').toUpperCase();

        LOG.logger.logFunc('createPreOrder', 'signature: ' + sTargetSig);

        var oPostOption = {
            hostname: 'api.mch.weixin.qq.com',
            path: '/pay/unifiedorder',
            method: 'POST'
        };

        var oPostData = '<xml>';
        oPostData += '<appid>';
        oPostData += escapeXMLValue(sAppId);
        oPostData += '</appid>';
        oPostData += '<attach>';
        oPostData += escapeXMLValue(sAttach);
        oPostData += '</attach>';
        oPostData += '<body>';
        oPostData += escapeXMLValue(sBody);
        oPostData += '</body>';
        oPostData += '<mch_id>';
        oPostData += escapeXMLValue(sMchId);
        oPostData += '</mch_id>';
        oPostData += '<nonce_str>';
        oPostData += escapeXMLValue(sNonceStr);
        oPostData += '</nonce_str>';
        oPostData += '<notify_url>';
        oPostData += escapeXMLValue(sNotifyUrl);
        oPostData += '</notify_url>';
        oPostData += '<openid>';
        oPostData += escapeXMLValue(sOpenId);
        oPostData += '</openid>';
        oPostData += '<out_trade_no>';
        oPostData += escapeXMLValue(sOutTradeNo);
        oPostData += '</out_trade_no>';
        oPostData += '<spbill_create_ip>';
        oPostData += escapeXMLValue(sSpBillCreateIp);
        oPostData += '</spbill_create_ip>';
        oPostData += '<total_fee>';
        oPostData += escapeXMLValue(sTotalFee.toString());
        oPostData += '</total_fee>';
        oPostData += '<trade_type>';
        oPostData += escapeXMLValue(sTradeType);
        oPostData += '</trade_type>';
        oPostData += '<sign>';
        oPostData += escapeXMLValue(sTargetSig);
        oPostData += '</sign>';
        oPostData += '</xml>';

        var oPostReq = https.request(oPostOption, function(weChatRes) {
                console.log('STATUS: ' + weChatRes.statusCode);
                console.log('HEADERS: ' + JSON.stringify(weChatRes.headers));
                weChatRes.setEncoding('utf8');
                weChatRes.on('data', function (chunk) {
                    console.log('BODY: ' + chunk);
                    var oRet = parsePreOrderResponse(chunk);
                    LOG.logger.logFunc('createPreOrder', 'pre-order response: ' + JSON.stringify(oRet));

                    if (oRet.return_code === 'SUCCESS' && oRet.return_msg === 'OK') {
                        var oPreparedPayData = {};

                        var sAppId2 = APP_ID;
                        var sTimestamp2 = new Date().getTime();
                        var sNonceStr2 = oRet.nonce_str;
                        var sPackage2 = 'prepay_id=' + oRet.prepay_id;
                        var sSignType2 = 'MD5';

                        var sAppIdKeyValue2 = 'appId=' + sAppId2;
                        var sTimestampKeyValue2 = 'timeStamp=' + sTimestamp2;
                        var sNonceStrKeyValue2 = 'nonceStr=' + sNonceStr2;
                        var sPackageKeyValue2 = 'package=' + sPackage2;
                        var sSignTypeKeyValue2 = 'signType=' + sSignType2;

                        var md5sum2 = crypto.createHash('md5');
                        var aStr2 = [sAppIdKeyValue2, sTimestampKeyValue2, sNonceStrKeyValue2, sPackageKeyValue2, sSignTypeKeyValue2];
                        aStr2.sort();
                        var sTempStr2 = aStr2.join('&');
                        sTempStr2 += '&key=';
                        sTempStr2 += API_KEY;

                        md5sum2.update(sTempStr2);
                        var sTargetSig2 = md5sum2.digest('hex').toUpperCase();

                        oPreparedPayData.actualPaySign = sTargetSig2;
                        oPreparedPayData.signTime = sTimestamp2;

                        res.send({
                            status: 'OK',
                            data: oRet,
                            payData: oPreparedPayData
                        });
                    } else {
                        res.send({
                            error: '微信支付遇到问题。Create pre-order failed.'
                        });
                    }
                    
                });
                //res.send({data: 'OK'})

                weChatRes.on('error', function (e) {
                    LOG.logger.logFunc('createPreOrder', 'pre-order response error: ' + e.message);
                });
            }
        );

        oPostReq.on('error', function(e) {
            LOG.logger.logFunc('createPreOrder -> post pre-order request error', e.message);
        });

        oPostReq.write(oPostData);
        oPostReq.end();
    };

    parsePreOrderResponse = function(sData) {
        var oRet = {};
        var oData = xmlLite.parseString(sData)
        if (oData && oData.childs && oData.childs.length > 0) {
            for (var i = 0; i < oData.childs.length; i++) {
                var oCurChild = oData.childs[i];
                oRet[oCurChild.name] = oCurChild.childs[0];
            }
        }
        return oRet;
    };

    escapeXMLValue = function(sValue) {
        return '<![CDATA[' + sValue + ']]>';
    };

    createRandomString = function(iLen) {
        if (iLen < 1) {
            return '';
        } else {
            var sCharSet = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
            var maxPos = sCharSet.length;
            var sRet = '';
            for (i = 0; i < iLen; i++) {
                sRet += sCharSet.charAt(Math.floor(Math.random() * maxPos));
            }
            return sRet;
        }
    };

    getClientIp = function(req) {
        var ipAddress;
        var forwardedIpsStr = req.header('x-forwarded-for') || req.headers['x-real-ip'];
        if (forwardedIpsStr) {
            var forwardedIps = forwardedIpsStr.split(',');
            ipAddress = forwardedIps[0];
        }
        if (!ipAddress) {
            ipAddress = req.connection.remoteAddress;
        }
        if (!ipAddress) {
            ipAddress = req.socket.remoteAddress;
        }

        var aParts = ipAddress.split(':');
        if (aParts.length > 1) {
            return aParts[aParts.length - 1];
        } else {
            return ipAddress;
        }
    };

    wechatPayConfirm = function(req, res) {
        var oConfirmData = {};

        // for (prop in req.body) {
        //     LOG.logger.logFunc('wechatPayConfirm body', prop + ': ' + req.body[prop]);
        // }

        // for (prop in req.query) {
        //     LOG.logger.logFunc('wechatPayConfirm query', prop + ': ' + req.query[prop]);
        // }
        LOG.logger.logFunc('wechatPayConfirm rawBody', req.rawBody);

        var oData = xmlLite.parseString(req.rawBody);
        if (oData && oData.childs && oData.childs.length > 0) {
            for (var i = 0; i < oData.childs.length; i++) {
                var oCurChild = oData.childs[i];
                oConfirmData[oCurChild.name] = oCurChild.childs[0];
            }
        }
        LOG.logger.logFunc('wechatPayConfirm', oConfirmData.toString());

        var sOrderId = oConfirmData['out_trade_no'];
        var oQuery = Order.findById(sOrderId);
        oQuery.exec(function(err, oOrder) {
            if (err) {
                LOG.logger.logFunc('wechatPayConfirm', err.message);
            } else {
                if (!oOrder) {
                    LOG.logger.logFunc('wechatPayConfirm', 'Order with Id:' + sOrderId + ' not found!');
                } else {
                    if (oOrder.status === '待付款') {
                        oOrder.status = '待发货';
                        oOrder.lastModified = new Date();
                        oOrder.payTime = new Date();
                        oOrder.save(function(err) {
                            if (err) {
                                LOG.logger.logFunc('wechatPayConfirm', 'Update order status failed');
                            } else {
                                var oPostData = '<xml>';
                                oPostData += '<return_code>';
                                oPostData += escapeXMLValue('SUCCESS');
                                oPostData += '</return_code>';
                                oPostData += '<return_msg>';
                                oPostData += escapeXMLValue('OK');
                                oPostData += '</return_msg>';
                                oPostData += '</xml>';
                                res.send(oPostData);
                            }
                        });
                    } else {
                        //Already confirmed before.
                        var oPostData = '<xml>';
                        oPostData += '<return_code>';
                        oPostData += escapeXMLValue('SUCCESS');
                        oPostData += '</return_code>';
                        oPostData += '<return_msg>';
                        oPostData += escapeXMLValue('OK');
                        oPostData += '</return_msg>';
                        oPostData += '</xml>';
                        res.send(oPostData);
                    }
                }
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
        } else if (sAction === 'getTestUserOpenId') {
            var sUserId = req.query.userId;
            getTestUserOpenId(sUserId, res);
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
            } else if (sAction === 'createPreOrder') {
                createPreOrder(req, res);
            }
        } else {
            var data = '';
            req.setEncoding('utf8');
            req.on('data', function(chunk) { 
                data += chunk;
            });
            req.on('end', function() {
                req.rawBody = data;
                wechatPayConfirm(req, res);
            });
        }
    };

    //Link routes and actions
    app.get('/security', getService);
    app.post('/security', postService);
};
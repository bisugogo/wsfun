/**
 * Security
 *
 * @module      :: Routes
 * @description :: Maps routes and actions
 */

var http = require('http');
var User = require('../models/User.js');

var APP_ID = 'wxf26855bd0cda23bd';
var SECRET = '498e6f493c29733d46e212c441f505e8';

module.exports = function(app) {

    getWechatUserOpenId = function(sCode, res) {
        http.get('https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + APP_ID +
            '&secret=' + SECRET +
            '&code=' + sCode + '&grant_type=authorization_code', function(weChatRes) {
                res.send(weChatRes);
            }
        );
    };

    getService = function(req, res) {
        var sAction = req.query.action;
        if (sAction === 'getWechatUserOpenId') {
            var sCode = req.query.code;
            var sSecret = req.query.secret;
            var sGrantType = req.query.grant_type;
            console.log("********************");
            console.log("security get service: getWechatUserOpenId");
            console.log("code: " + sCode);
            console.log("secret: " + sSecret);
            console.log("grant_type: " + sGrantType);
            console.log("********************");

            getWechatUserOpenId(sCode, res);
        } else {
            console.log("********************");
            console.log("security get service: not supported action");
            console.log("********************");

        }
    };

    postService = function (req, res) {
    // var sAction = req.body.action;
    // if (sAction && sAction !== '') {
    //   if (sAction === 'createDesign') {
    //     createDesign(req.body.data, res);
    //   } else if (sAction === 'deleteDesign') {
    //     deleteTshirt(req.body.data, res);
    //   } else if (sAction === 'createOrder') {
    //     createOrder(req.body.data, res);
    //   }
    // }
    };

    //Link routes and actions
    app.get('/security', getService);
    app.post('/security', postService);
}
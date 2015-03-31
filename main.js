// Dependencies requirements, Express 4
var mongoose       = require("mongoose");
var express        = require('express');
var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var crypto         = require('crypto');
var app            = express();

//var session = require('express-session');
// var passport = require('passport');
// var WechatStrategy = require('../lib/strategy');
 
 
// passport.serializeUser(function (user, done) {
//     done(null, user);
// });
 
// passport.deserializeUser(function (obj, done) {
//     done(null, obj);
// });

var WCManager = require('./routes/WeChatManager');
var FDManager = require('./routes/FakeDataManager');

var wechat = require('wechat');

app.use(express.query()); // Or app.use(express.query());

app.use(express.static(__dirname + '/app'));
app.use(morgan('dev'));
app.use(bodyParser());
app.use(methodOverride());

// MongoDB configuration
mongoose.connect('mongodb://localhost/tshirt', function(err, res) {
  if(err) {
    console.log('error connecting to MongoDB Database. ' + err);
  } else {
    console.log('Connected to Database');
  }
});

//Add the routes
routes = require('./routes/tshirt')(app);
securityRoutes = require('./routes/security')(app);
fileService = require('./routes/fileService')(app);

//Set up security token intervals
updateAccessToken();
setInterval(updateAccessToken, 3600*1000);

app.listen(10001);
console.log('Im listening on port 80');

// First example router
app.get('/', function(req, res) {
  res.sendfile('app/index.html');
});

app.get('/wechat', function(req, res) {
    var shasum = crypto.createHash('sha1');
    var sSignature = req.query.signature;
    var sTime = req.query.timestamp;
    var sNonce = req.query.nonce;
    var sToken = 'weavesfun';
    var sEchoStr = req.query.echostr;

    var aStr = [sToken, sTime, sNonce];
    aStr.sort();
    console.log(aStr.toString());
    shasum.update(aStr.join(''));
    var sTargetSig = shasum.digest('hex');
    console.log(sTargetSig);

    if (sTargetSig === sSignature) {
        res.send(sEchoStr);
    } else {
        res.send('Wrong Signature');
    }
});

var config = {
    token: 'weavesfun',
    appid: 'wxf26855bd0cda23bd',
    encodingAESKey: 'y3CtyrA1LRhh3Bz6aTllJ2UspJHiI8I6TN4E32IP08h'
};

app.use('/wechat', wechat(config, function (req, res, next) {
    var oWCMgr = new WCManager.WeChatManager();
    console.log('new WeChatManager succeed!');
    oWCMgr.doAction(req, res);
}));

app.post('/wechatTest', function(req, res) {
    var oWCMgr = new WCManager.WeChatManager();
    var oDataMgr = new FDManager.FakeDataManager();
    var oData = oDataMgr.getWechatEvent();
    console.log('wechat test new WeChatManager succeed!');
    console.log(JSON.stringify(oData));
    req.weixin = oData;
    res.reply = function(str) {
      console.log(str);
    }
    oWCMgr.doAction(req, res);
});


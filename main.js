// Dependencies requirements, Express 4
var express        = require('express');
var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var mongoose       = require("mongoose");
var crypto         = require('crypto');
var app            = express();
var WCManager = require('./routes/WeChatManager');

var wechat = require('wechat');

app.use(express.query()); // Or app.use(express.query());

app.use(express.static(__dirname + '/app'));
app.use(morgan('dev'));
app.use(bodyParser());
app.use(methodOverride());

//Add the routes
routes = require('./routes/tshirt')(app);

// MongoDB configuration
mongoose.connect('mongodb://localhost/tshirt', function(err, res) {
  if(err) {
    console.log('error connecting to MongoDB Database. ' + err);
  } else {
    console.log('Connected to Database');
  }
});

app.listen(80);
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


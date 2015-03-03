// Dependencies requirements, Express 4
var express        = require('express');
var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var mongoose        = require("mongoose");
var app            = express();

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

app.listen(10001);
console.log('Im listening on port 10001');

// First example router
app.get('/', function(req, res) {
  res.sendfile('app/index.html');
});
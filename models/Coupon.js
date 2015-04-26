var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = require('../models/User.js');

var CouponSchema = new Schema({
  _ownerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  couponNumber: {
    type: Number,
    require: true
  },
  status: {
    type: String,
    require: true
  },
  couponValue: {
    type: Number,
    require: true
  },
  scope: {
    type: String,
    default: ""
  },
  validFrom: {
    type    : Date,
    default : Date.now
  },
  validTo: {
    type    : Date,
    default : Date.now
  },
});

module.exports = mongoose.model('Coupon', CouponSchema);
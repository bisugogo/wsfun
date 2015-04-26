var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Order = require('../models/order.js');
var Coupon = require('../models/Coupon.js');
var CouponSchema = mongoose.model('Coupon').schema;

var UserSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    require: true
  },
  wechatId: {
    type: String,
    require: true
  },
  status: {
    type: Number,
    require: true
  },
  name: {
    type: String,
    default: ''
  },
  coupons: [{
    type: Schema.Types.ObjectId,
    ref: 'Coupon'
  }],
  orders: [{
    type: Schema.Types.ObjectId,
    ref: 'Order'
  }]
});

module.exports = mongoose.model('User', UserSchema);
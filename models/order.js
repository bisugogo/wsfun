var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Coupon = require('../models/Coupon.js');
var User = require('../models/User.js');
var Design = require('../models/tshirt.js');
//var UserSchema = mongoose.model('User').schema;
//var CouponSchema = mongoose.model('Coupon').schema;

var OrderSchema = new Schema({
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  designId: {
    type: Schema.Types.ObjectId,
    ref: 'Design'
  },
  payerId: {
    type: String,
    default: ''
  },
  mailInfo: {
    type: String,
    default: ''
  },
  malePrice:    {
    type    : Number,
    require : true
  },
  femalePrice:    {
    type    : Number,
    require : true
  },
  kidPrice:    {
    type    : Number,
    require : true
  },
  totalPrice:    {
    type    : Number,
    require : true
  },
  totalQuantity: {
    type    : Number,
    require : true
  },
  maleSize:     {
    type    : String,
    require : true
  },
  maleQuantity :   {
    type    : String,
    require : true
  },
  femaleSize:     {
    type    : String,
    require : true
  },
  femaleQuantity :   {
    type    : String,
    require : true
  },
  kidSize:     {
    type    : String,
    require : true
  },
  kidQuantity :   {
    type    : String,
    equire : true
  },
  contact: {
    type: String,
    require: true
  },
  contactMobile: {
    type: String,
    require: true
  },
  country: {
    type: String,
    default: 'China'
  },
  province: {
    type: String,
    require: true
  },
  city: {
    type: String,
    require: true
  },
  district: {
    type: String,
    default: ''
  },
  postCode: {
    type: String,
    default: ''
  },
  detailAddress: {
    type: String,
    require: true
  },
  createdTime: {
    type    : Date,
    default : Date.now
  },
  payTime: {
    type    : Date,
    default : ''
  },
  lastModified: {
    type    : Date,
    default : Date.now
  },
  status:   {
    type: String,
    enum    :  ['待付款', '待发货', '已发货', '交易完成'],
    require : true,
    default : '待付款'
  },
  wechatStatus: {
    type: Number,
    default: 0
  },
  coupons: [{
    type: Schema.Types.ObjectId,
    ref: 'Coupon'
  }]
});

// OrderSchema.path('model').validate(function (v) {
//   return ((v != "") && (v != null));
// });

module.exports = mongoose.model('Order', OrderSchema);
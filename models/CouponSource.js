var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CouponSourceSchema = new Schema({
  couponNumber: {
    type: Number,
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
  imgSrc: {
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
  }
});

module.exports = mongoose.model('CouponSource', CouponSourceSchema);
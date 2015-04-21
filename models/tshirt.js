var Order = require('../models/order.js');
var User = require('../models/User.js');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var OrderSchema = mongoose.model('Order').schema;
var UserSchema = mongoose.model('User').schema;

var DesignSchema = new Schema({
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  color:   {
    type: String
  },
  gender: {
    type: String,
    default: 'male'
  },
  price :   {
    type    : Number,
    require : true
  },
  modified: {
    type    : Date,
    default : Date.now
  },
  desc:   {
    type: String
  },
  access:   {
    type: String
  },
  previewImage64: {
    type: String,
    default: ''
  },
  designFileId: {
    type: String,
    default: ''
  },
  orders: [OrderSchema]
});

// DesignSchema.path('model').validate(function (v) {
//   return ((v != "") && (v != null));
// });

module.exports = mongoose.model('Design', DesignSchema);
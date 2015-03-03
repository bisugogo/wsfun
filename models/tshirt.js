var Order = require('../models/order.js');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var OrderSchema = mongoose.model('Order').schema

var DesignSchema = new Schema({

  model:    {
    type    : String,
    require : true
  },
  style:    {
    type    : String,
    enum    :  ['Casual', 'Vintage', 'Alternative'],
    require : true
  },
  size:     {
    type    : String,
    enum    : ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    require : true
  },
  color:   {
    type: String
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
  orders: [OrderSchema]
});

// DesignSchema.path('model').validate(function (v) {
//   return ((v != "") && (v != null));
// });

module.exports = mongoose.model('Design', DesignSchema);
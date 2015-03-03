var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OrderSchema = new Schema({

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
  maleSize:     {
    type    : String,
    enum    : ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    require : true
  },
  maleQuantity :   {
    type    : Number,
    require : true
  },
  femaleSize:     {
    type    : String,
    enum    : ['XS', 'S', 'M', 'L', 'XL'],
    require : true
  },
  femaleQuantity :   {
    type    : Number,
    require : true
  },
  kidSize:     {
    type    : String,
    enum    : ['XS', 'S', 'M', 'L', 'XL'],
    require : true
  },
  kidQuantity :   {
    type    : Number,
    default : 0
  },
  lastModified: {
    type    : Date,
    default : Date.now
  },
  status:   {
    type: String,
    enum    :  ['待付款', '待发货', '已发货', '交易完成'],
    require : true
  }
});

// OrderSchema.path('model').validate(function (v) {
//   return ((v != "") && (v != null));
// });

var oOrder = mongoose.model('Order', OrderSchema);
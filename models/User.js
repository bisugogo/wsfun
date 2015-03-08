var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  wechatId: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('User', UserSchema);
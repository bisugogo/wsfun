var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = mongoose.model('User').schema;

var ArtifactSchema = new Schema({
  // creatorId: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'User'
  // },
  description: {
    type: String,
    default: ''
  },
  fileId: {
    type: String,
    require: true
  },
  fileName: {
    type: String,
    default: ''
  },
  smallImage64: {
    type: String,
    default: ''
  },
  midImage64: {
    type: String,
    default: ''
  },
  largeImage64: {
    type: String,
    default: ''
  },
  createdTime: {
    type    : Date,
    default : Date.now
  },
  lastModifiedTime: {
    type    : Date,
    default : Date.now
  },
});

module.exports = mongoose.model('Artifact', ArtifactSchema);
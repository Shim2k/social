var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var postSchema = new Schema({
  //All user properties
  //We will add/modify more in the future
  title: String,
  date: { type: Date, default: Date.now },
  author: { type: Schema.Types.ObjectId, ref: 'user' },
  content: String,
  tags: [String],
})

module.exports = mongoose.model('post', postSchema);

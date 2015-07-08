var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({
  //All user properties
  //We will add more in the future
  email: String,
  username: String,
  pass_hash: String,
  user_salt: String,
  posts: [{ type: Schema.Types.ObjectId, ref: 'post' }],
  post_count: { type: Number, default: 0 },
  followers: [{ type: Schema.Types.ObjectId, ref: 'user' }],
  followers_count: { type: Number, default: 0 },
  following: [{ type: Schema.Types.ObjectId, ref: 'user' }, { String }],
  following_count: { type: Number, default: 0 },
})

module.exports = mongoose.model('user', userSchema);

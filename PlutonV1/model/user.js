var mongoose = require('mongoose');
var Schema = mongoose.Schema;

userSchema = new Schema({
  username: String,
  password: String,
  role: String,
  isFirstLogin: Boolean,
  is_delete: { type: Boolean, default: false }
}),
user = mongoose.model('user', userSchema);
module.exports = user;

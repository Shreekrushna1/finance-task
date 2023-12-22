const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/finance');

const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  details:Array
});
module.exports = mongoose.model('users',userSchema);
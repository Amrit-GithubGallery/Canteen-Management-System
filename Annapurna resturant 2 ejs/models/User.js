const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  employeeType: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);

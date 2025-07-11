const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    name: String,
    employeeId: String
  },
  items: [{
    name: String,
    price: Number
  }],
  total: Number,
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    maxlength: 100
  },
  subject: {
    type: String,
    maxlength: 150
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);

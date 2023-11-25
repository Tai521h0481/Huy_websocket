const mongoose = require('mongoose');

// Define the Message schema
const messageSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  }
});

// Define the Message model
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;

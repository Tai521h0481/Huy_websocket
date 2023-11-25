'use strict';
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: Number,
        required: true
    },
    // If you need to reference users in the room
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Assuming 'User' is another model
    }]
});

module.exports = mongoose.model('Room', roomSchema);

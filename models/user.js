'use strict';
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: String,
    follower: Number,
    liked: Number,
    disliked: Number,
    // Reference to the Room model
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    }
});

module.exports = mongoose.model('User', userSchema);

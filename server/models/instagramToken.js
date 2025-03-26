const mongoose = require('mongoose');

const InstagramTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    clientSecret: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    userId: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('InstagramToken', InstagramTokenSchema);

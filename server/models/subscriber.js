const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
    emailHash: {
        type: String,
        required: true,
        unique: true
    },
    emailEncrypted: {
        type: String,
        required: true
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Subscriber', subscriberSchema);

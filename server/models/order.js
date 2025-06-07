const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    encryptedName: { type: String, required: true },
    encryptedEmail: { type: String, required: true },
    emailHash: { type: String, required: true, index: true },
    details: { type: String, required: true },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

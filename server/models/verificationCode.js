const mongoose = require("mongoose");

const verificationCodeSchema = new mongoose.Schema({
    emailHash: { type: String, required: true, index: true, unique: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } } // TTL index
});

module.exports = mongoose.model("VerificationCode", verificationCodeSchema);

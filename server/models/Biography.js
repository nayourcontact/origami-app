const mongoose = require('mongoose');

const BiographySchema = new mongoose.Schema({
    igId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    biography: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Biography', BiographySchema);

const mongoose = require('mongoose');

const InstagramPostSchema = new mongoose.Schema({
    igId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    mediaType: String,
    mediaUrl: String,
    thumbnailUrl: String,
    caption: String,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('InstagramPost', InstagramPostSchema);

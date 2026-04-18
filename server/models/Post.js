const mongoose = require('mongoose');

const InstagramPostSchema = new mongoose.Schema({
    igId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    mediaType: String,
    mediaUrl: String,
    thumbnailUrl: String,
    localMediaPath: String,
    localThumbnailPath: String,
    caption: String,
    timestamp: {
        type: Date,
        required: false,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InstagramPost', InstagramPostSchema);
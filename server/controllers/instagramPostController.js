const {
    fetchInstagramPosts,
    getInstagramImagesByUser,
    getInstagramVideosByUser
} = require('../services/instagramPostService');
const InstagramPost = require('../models/Post');

const getPosts = async (req, res, next) => {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    try {
        await fetchInstagramPosts(userId);

        const skip = (page - 1) * limit;
        const posts = await InstagramPost.find({ userId })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await InstagramPost.countDocuments({ userId });

        res.json({
            success: true,
            posts,
            total,
            page,
            pageCount: Math.ceil(total / limit)
        });
    } catch (err) {
        next(err);
    }
};

const getImagePosts = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const images = await getInstagramImagesByUser(userId);
        res.json({ success: true, posts: images });
    } catch (err) {
        next(err);
    }
};

const getVideoPosts = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const videos = await getInstagramVideosByUser(userId);
        res.json({ success: true, posts: videos });
    } catch (err) {
        next(err);
    }
};

const deleteAllPosts = async (req, res, next) => {
    try {
        const result = await InstagramPost.deleteMany({});
        res.json({
            success: true,
            deletedCount: result.deletedCount,
            message: 'All Instagram posts deleted successfully'
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getPosts,
    getImagePosts,
    getVideoPosts,
    deleteAllPosts
};

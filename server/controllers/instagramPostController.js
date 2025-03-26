const {
    fetchInstagramPosts,
    getInstagramImagesByUser,
    getInstagramVideosByUser
} = require('../services/instagramPostService');
const InstagramPost = require('../models/Post');

const getPosts = async (req, res) => {
    const userId = req.params.userId;
    try {
        const {data, fromCache} = await fetchInstagramPosts(userId);
        return res.json({
            success: true,
            cached: fromCache,
            posts: data,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
        });
    }
};

const getVideoPosts = async (req, res) => {
    const userId = req.params.userId;
    try {
        const videos = await getInstagramVideosByUser(userId);
        return res.json({success: true, posts: videos});
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
        });
    }
};

const getImagePosts = async (req, res) => {
    const userId = req.params.userId;
    try {
        const images = await getInstagramImagesByUser(userId);
        return res.json({success: true, posts: images});
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
        });
    }
};

const deleteAllPosts = async (req, res) => {
    try {
        const result = await InstagramPost.deleteMany({});
        return res.json({
            success: true,
            deletedCount: result.deletedCount,
            message: 'All Instagram posts deleted successfully',
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message,
        });
    }
};

module.exports = {
    getPosts,
    getVideoPosts,
    getImagePosts,
    deleteAllPosts
};

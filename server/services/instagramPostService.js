const axios = require('axios');
const InstagramPost = require('../models/Post');
const {getTokenByUserId} = require('./instagramTokenService');

const INSTAGRAM_MEDIA_FIELDS = 'id,media_type,media_url,thumbnail_url,caption,timestamp';

const fetchInstagramPosts = async (userId) => {
    const cachedPosts = await InstagramPost.find({userId}).lean();
    if (cachedPosts.length > 0) {
        return {data: cachedPosts, fromCache: true};
    }

    try {
        const tokenRecord = await getTokenByUserId(userId);
        if (!tokenRecord?.token) {
            const err = new Error(`Access token not found for user: ${userId}`);
            err.statusCode = 404;
            throw err;
        }

        let allPosts = [];
        let nextUrl = `https://graph.instagram.com/me/media?fields=${INSTAGRAM_MEDIA_FIELDS}&access_token=${tokenRecord.token}`;

        while (nextUrl) {
            const response = await axios.get(nextUrl, {timeout: 5000});

            const posts = response.data?.data || [];

            for (const post of posts) {
                const saved = await InstagramPost.findOneAndUpdate(
                    {igId: post.id},
                    {
                        userId,
                        mediaType: post.media_type,
                        mediaUrl: post.media_url,
                        thumbnailUrl: post.thumbnail_url || null,
                        caption: post.caption || '',
                        timestamp: post.timestamp ? new Date(post.timestamp) : null,
                        updatedAt: new Date(),
                    },
                    {
                        new: true,
                        upsert: true,
                        setDefaultsOnInsert: true,
                    }
                );
                allPosts.push(saved);
            }

            nextUrl = response.data?.paging?.next || null;
        }

        return {data: allPosts, fromCache: false};

    } catch (error) {
        const isAxiosError = !!error?.response?.data?.error?.message;

        console.error(`[InstagramPostService] Error for user ${userId}`);
        console.error('Raw error:', {
            message: error.message,
            response: isAxiosError ? error.response.data.error : null,
        });

        const err = new Error(
            isAxiosError
                ? `Instagram API error: ${error.response.data.error.message}`
                : error.message || 'Unknown error'
        );

        err.statusCode = isAxiosError ? 502 : 500;
        throw err;
    }
};

const getInstagramVideosByUser = async (userId) => {
    return InstagramPost.find({userId, mediaType: 'VIDEO'}).lean();
};

const getInstagramImagesByUser = async (userId) => {
    return InstagramPost.find({
        userId,
        mediaType: {$in: ['IMAGE', 'CAROUSEL_ALBUM']},
    }).lean();
};

const getHighlightedPost = async (userId) => {
    return InstagramPost.findOne({
        userId,
        caption: { $regex: /Icar\s*\(Ίκαρος\)/i }
    }).lean();
};

module.exports = {
    fetchInstagramPosts,
    getInstagramVideosByUser,
    getInstagramImagesByUser,
    getHighlightedPost
};

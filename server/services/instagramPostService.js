const axios = require('axios');
const InstagramPost = require('../models/Post');
const {getTokenByUserId} = require('../services/instagramTokenService');

const INSTAGRAM_MEDIA_FIELDS = 'id,media_type,media_url,thumbnail_url,caption';

const fetchInstagramPosts = async (userId) => {
    const cachedPosts = await InstagramPost.find({ userId }).lean();
    if (cachedPosts.length > 0) {
        return { data: cachedPosts, fromCache: true };
    }

    try {
        const tokenRecord = await getTokenByUserId(userId);
        if (!tokenRecord?.token) throw new Error('Access token not found');

        let allPosts = [];
        let nextUrl = `https://graph.instagram.com/me/media?fields=${INSTAGRAM_MEDIA_FIELDS}&access_token=${tokenRecord.token}`;

        // Paging loop
        while (nextUrl) {
            const response = await axios.get(nextUrl, { timeout: 5000 });

            const posts = response.data?.data || [];

            for (const post of posts) {
                const saved = await InstagramPost.findOneAndUpdate(
                    { igId: post.id },
                    {
                        userId,
                        mediaType: post.media_type,
                        mediaUrl: post.media_url,
                        thumbnailUrl: post.thumbnail_url || null,
                        caption: post.caption || '',
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

            // Update URL for next page
            nextUrl = response.data?.paging?.next || null;
        }

        return { data: allPosts, fromCache: false };

    } catch (error) {
        const errMsg = error?.response?.data?.error?.message || error.message || 'Unknown error';
        console.error(`Failed to fetch Instagram posts for user ${userId}: ${errMsg}`);
        throw new Error('Could not retrieve Instagram posts');
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

module.exports = {
    fetchInstagramPosts,
    getInstagramVideosByUser,
    getInstagramImagesByUser,
};

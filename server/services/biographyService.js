const axios = require('axios');
const Biography = require('../models/biography');
const {getTokenByUserId} = require('./instagramTokenService');

const INSTAGRAM_FIELDS = 'id,username,biography';

const fetchBiography = async (userId) => {
    try {
        const cachedData = await Biography.findOne({igId: userId}).lean();
        if (cachedData) {
            return {data: cachedData, fromCache: true};
        }

        const tokenRecord = await getTokenByUserId(userId);
        if (!tokenRecord?.token) {
            throw new Error(`Access token not found for user: ${userId}`);
        }

        const response = await axios.get(`https://graph.instagram.com/${userId}`, {
            params: {
                fields: INSTAGRAM_FIELDS,
                access_token: tokenRecord.token,
            },
            timeout: 5000,
        });

        const {id, username, biography} = response.data;
        const updatedDoc = await Biography.findOneAndUpdate(
            {igId: id.toString()},
            {
                username,
                biography,
                updatedAt: new Date(),
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            }
        );

        return {data: updatedDoc, fromCache: false};
    } catch (error) {
        const errMsg = error?.response?.data?.error?.message || error.message || 'Unknown error';
        console.error(`Failed to fetch Instagram data for user ${userId}: ${errMsg}`);
        throw new Error('Could not retrieve Instagram data');
    }
};

module.exports = {fetchBiography};

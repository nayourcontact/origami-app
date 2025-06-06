const axios = require('axios');
const Biography = require('../models/biography');
const {getTokenByUserId} = require('./instagramTokenService');

const INSTAGRAM_FIELDS = 'id,username,biography';

const fetchBiography = async (userId) => {
    try {
        // Check if cached
        const cachedData = await Biography.findOne({igId: userId}).lean();
        if (cachedData) {
            return {data: cachedData, fromCache: true};
        }

        // Get token
        const tokenRecord = await getTokenByUserId(userId);
        if (!tokenRecord?.token) {
            const err = new Error(`Access token not found for user: ${userId}`);
            err.statusCode = 404;
            throw err;
        }

        // Call Instagram
        const response = await axios.get(`https://graph.instagram.com/${userId}`, {
            params: {
                fields: INSTAGRAM_FIELDS,
                access_token: tokenRecord.token,
            },
            timeout: 5000,
        });

        const {id, username, biography} = response.data;

        // Update DB
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
        const isAxiosError = !!error?.response?.data?.error?.message;

        console.error(`[BiographyService] Error for user ${userId}`);
        console.error('Raw error:', {
            message: error.message,
            stack: error.stack,
            response: isAxiosError ? error.response.data.error : null
        });

        const err = new Error(isAxiosError
            ? `Instagram API error: ${error.response.data.error.message}`
            : error.message || 'Unknown error');

        err.statusCode = isAxiosError ? 502 : 500;
        throw err;
    }
};

module.exports = {fetchBiography};

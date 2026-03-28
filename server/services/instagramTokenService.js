const InstagramToken = require('../models/InstagramToken');
const {encrypt, decrypt} = require('../utils/encryption');
const axios = require('axios');

const saveToken = async ({token, expiresAt, userId, clientSecret}) => {
    try {
        const encryptedToken = encrypt(token);
        const encryptedSecret = encrypt(clientSecret);

        const existing = await InstagramToken.findOne({userId});
        if (existing) {
            existing.token = encryptedToken;
            existing.clientSecret = encryptedSecret;
            existing.expiresAt = expiresAt;
            existing.updatedAt = new Date();
            await existing.save();
            return existing;
        } else {
            const newToken = new InstagramToken({
                token: encryptedToken,
                clientSecret: encryptedSecret,
                expiresAt,
                updatedAt: new Date(),
                userId,
            });
            await newToken.save();
            return newToken;
        }
    } catch (error) {
        console.error(`Failed to save token for user ${userId}:`, error);
        const err = new Error('Could not save Instagram token');
        err.statusCode = 500;
        throw err;
    }
};

const getTokenByUserId = async (userId) => {
    try {
        const record = await InstagramToken.findOne({userId}).lean();
        if (!record) return null;

        return {
            ...record,
            token: decrypt(record.token),
            clientSecret: decrypt(record.clientSecret),
        };
    } catch (error) {
        console.error(`Failed to retrieve token for user ${userId}:`, error);
        const err = new Error('Could not retrieve Instagram token');
        err.statusCode = 500;
        throw err;
    }
};

const refreshInstagramToken = async (userId) => {
    const record = await getTokenByUserId(userId);
    if (!record) {
        const err = new Error('User token not found');
        err.statusCode = 404;
        throw err;
    }

    try {
        console.log('Sending refresh request for token:', record.token);
        const response = await axios.get('https://graph.instagram.com/refresh_access_token', {
            params: {
                grant_type: 'ig_refresh_token',
                access_token: record.token,
            },
            timeout: 5000
        });

        const { access_token, expires_in } = response.data;

        // Calculate new expiry date
        const expiresAt = new Date(Date.now() + expires_in * 1000);


        // Save the new token
        await saveToken({
            token: access_token,
            expiresAt,
            userId,
            clientSecret: record.clientSecret, // optional reuse
        });

        return {
            access_token,
            expires_in,
            expiresAt,
        };

    } catch (error) {
        const errMsg = error?.response?.data?.error?.message || error.message || 'Unknown error';
        console.error(`Token refresh failed for user ${userId}:`, errMsg);
        const err = new Error('Token refresh failed');
        err.statusCode = 502;
        throw err;
    }
};

const validateToken = async (userId) => {
    try {
        const record = await getTokenByUserId(userId);
        if (!record) {
            return {valid: false, error: 'Token not found'};
        }

        const {token} = record;
        const {data} = await axios.get('https://graph.instagram.com/me', {
            params: {
                fields: 'id,username',
                access_token: token,
            },
            timeout: 5000,
        });

        if (data?.id?.toString() === userId.toString()) {
            return {
                valid: true,
                username: data.username,
                userId: data.id,
            };
        }

        return {valid: false, error: 'Token mismatch or invalid user ID'};
    } catch (error) {
        const errMsg = error?.response?.data?.error?.message || error.message || 'Unknown error';
        console.error(`Token validation failed for user ${userId}:`, errMsg);
        return {valid: false, error: errMsg};
    }
};

module.exports = {
    saveToken,
    getTokenByUserId,
    refreshInstagramToken,
    validateToken
};

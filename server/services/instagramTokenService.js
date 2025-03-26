const InstagramToken = require('../models/instagramToken');
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
        console.error(`Failed to save Instagram token for user ${userId}:`, error);
        throw new Error('Could not save Instagram token');
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
        console.error(`Failed to retrieve Instagram token for user ${userId}:`, error);
        throw new Error('Could not retrieve Instagram token');
    }
};

const refreshInstagramToken = async (userId) => {
    const record = await getTokenByUserId(userId);
    if (!record) throw new Error('User token not found');

    try {
        const response = await axios.get(
            'https://graph.instagram.com/access_token',
            {
                params: {
                    grant_type: 'ig_exchange_token',
                    access_token: record.token,
                    client_secret: record.clientSecret,
                },
            }
        );

        return {
            access_token: response.data.access_token,
            expires_in: response.data.expires_in,
        };
    } catch (error) {
        console.error('Error refreshing Instagram token:', error.response?.data || error.message);
        throw new Error('Token refresh failed');
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
        const message = error?.response?.data?.error?.message || error.message || 'Unknown error';
        console.error(`Token validation failed for user ${userId}:`, message);
        return {valid: false, error: message};
    }
};

module.exports = {
    saveToken,
    getTokenByUserId,
    refreshInstagramToken,
    validateToken
};

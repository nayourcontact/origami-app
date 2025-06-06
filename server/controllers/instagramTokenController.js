const instagramTokenService = require('../services/instagramTokenService');

const saveToken = async (req, res, next) => {
    try {
        const {token, expiresAt, userId, clientSecret} = req.body;

        if (!token || !expiresAt || !userId || !clientSecret) {
            const error = new Error('Missing required fields.');
            error.statusCode = 400;
            throw error;
        }

        const saved = await instagramTokenService.saveToken({token, expiresAt, userId, clientSecret});
        res.status(200).json({message: 'Token and clientSecret saved.', data: saved});
    } catch (error) {
        next(error);
    }
};

const getToken = async (req, res, next) => {
    try {
        const {userId} = req.params;
        if (!userId) {
            const error = new Error('Missing userId');
            error.statusCode = 400;
            throw error;
        }

        const data = await instagramTokenService.getTokenByUserId(userId);
        if (!data) {
            const error = new Error('Token not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

const refreshToken = async (req, res, next) => {
    try {
        const {userId} = req.body;
        if (!userId) {
            const error = new Error('Missing userId');
            error.statusCode = 400;
            throw error;
        }

        const result = await instagramTokenService.refreshInstagramToken(userId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const validateToken = async (req, res, next) => {
    try {
        const {userId} = req.params;
        if (!userId) {
            const error = new Error('Missing userId');
            error.statusCode = 400;
            throw error;
        }

        const result = await instagramTokenService.validateToken(userId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    saveToken,
    getToken,
    refreshToken,
    validateToken
};

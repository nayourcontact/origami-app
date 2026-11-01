const instagramTokenService = require('../services/instagramTokenService');

const saveToken = async (req, res, next) => {
    try {
        const { token, expiresAt, userId } = req.body;
        const saved = await instagramTokenService.saveToken({ token, expiresAt, userId });
        res.status(200).json({ message: 'Token sikeresen mentve.', data: {configured: true, expiresAt: saved.expiresAt, updatedAt: saved.updatedAt} });
    } catch (error) {
        next(error);
    }
};

const getToken = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const data = await instagramTokenService.getTokenByUserId(userId);
        if (!data) {
            return res.status(404).json({ message: 'Token not found' });
        }
        res.status(200).json({configured: true, expiresAt: data.expiresAt, updatedAt: data.updatedAt});
    } catch (error) {
        next(error);
    }
};

const refreshToken = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const result = await instagramTokenService.refreshInstagramToken(userId);
        res.status(200).json({expiresAt: result.expiresAt});
    } catch (error) {
        next(error);
    }
};

const validateToken = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const result = await instagramTokenService.validateToken(userId);
        res.status(200).json({valid: !!result.valid, ...(result.valid ? {} : {error: 'A token nem érvényes.'})});
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

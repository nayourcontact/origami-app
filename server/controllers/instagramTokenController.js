const instagramTokenService = require('../services/instagramTokenService');

const saveToken = async (req, res) => {
    try {
        const { token, expiresAt, userId, clientSecret } = req.body;
        const saved = await instagramTokenService.saveToken({ token, expiresAt, userId, clientSecret });
        res.status(200).json({ message: 'Token + clientSecret saved', data: saved });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getToken = async (req, res) => {
    try {
        const { userId } = req.params;
        const data = await instagramTokenService.getTokenByUserId(userId);
        if (!data) return res.status(404).json({ message: 'Token not found' });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const refreshToken = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'Missing userId' });

        const result = await instagramTokenService.refreshInstagramToken(userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const validateToken = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ error: 'Missing userId' });

        const result = await instagramTokenService.validateToken(userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    saveToken,
    getToken,
    refreshToken,
    validateToken
};

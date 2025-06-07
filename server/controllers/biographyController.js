const {fetchBiography} = require('../services/biographyService');

const getBiography = async (req, res, next) => {
    const userId = req.params.id;

    try {
        const {data, fromCache} = await fetchBiography(userId);
        return res.json({
            success: true,
            cached: fromCache,
            user: {
                id: data.igId,
                username: data.username,
                biography: data.biography,
                updatedAt: data.updatedAt,
            },
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {getBiography};

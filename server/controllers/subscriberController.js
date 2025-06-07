const subscriberService = require("../services/subscriberService");

exports.sendCode = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await subscriberService.sendCode(email);
        res.status(result.status).json({ message: result.message });
    } catch (err) {
        next(err);
    }
};

exports.subscribe = async (req, res, next) => {
    try {
        const { email, code } = req.body;
        const result = await subscriberService.verifyAndSubscribe(email, code);
        res.status(result.status).json({ message: result.message });
    } catch (err) {
        next(err);
    }
};

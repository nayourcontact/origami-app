const orderService = require("../services/orderService");

exports.createOrder = async (req, res, next) => {
    try {
        const { name, email, details, notes } = req.body;

        await orderService.processOrder({ name, email, details, notes });

        res.status(200).json({ message: "Order submitted successfully." });
    } catch (error) {
        next(error);
    }
};

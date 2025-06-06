const orderService = require("../services/orderService");

exports.createOrder = async (req, res, next) => {
    try {
        const { name, email, details, notes } = req.body;

        if (!name || !email || !details) {
            const err = new Error("Name, email, and order details are required.");
            err.statusCode = 400;
            throw err;
        }

        await orderService.processOrder({ name, email, details, notes });

        res.status(200).json({ message: "Order submitted successfully." });
    } catch (error) {
        next(error);
    }
};

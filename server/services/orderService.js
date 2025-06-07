const crypto = require("crypto");
const Order = require("../models/Order");
const {sendConfirmationEmail, sendAdminOrderNotification} = require("./emailService");
const {encrypt, decrypt} = require("../utils/encryption");

function hashEmail(email) {
    return crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
}

exports.processOrder = async ({name, email, details, notes}) => {
    const orderId = 'ORD-' + crypto.randomBytes(3).toString('hex');
    const now = new Date().toLocaleString("hu-HU");
    const emailHash = hashEmail(email);

    try {
        await sendAdminOrderNotification({
            orderId,
            email,
            emailHash,
            time: now,
        });
        console.log(`[ORDER EMAIL]: Order sent successfully from: ${email}`);
    } catch (err) {
        console.error(`[ORDER EMAIL ERROR]: ${err.message}`);
        throw new Error("Failed to send order email.");
    }

    try {
        const encryptedEmail = encrypt(email);
        const encryptedName = encrypt(name);

        const order = new Order({
            orderId,
            encryptedName,
            encryptedEmail,
            emailHash,
            details,
            notes
        });

        await order.save();
        console.log(`[ORDER]: Order saved to DB for ${email}`);
    } catch (err) {
        console.error(`[ORDER DB ERROR]: ${err.message}`);
        throw new Error("Failed to save order.");
    }
};

exports.getAllOrders = async () => {
    return await Order.find({}).lean();
};

exports.getAllOrdersSorted = async () => {
    return await Order.find({})
        .sort({createdAt: -1}) // csökkenő sorrend
        .select("orderId createdAt emailHash details notes encryptedName encryptedEmail")
        .lean();
};

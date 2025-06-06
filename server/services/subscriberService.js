const crypto = require("crypto");
const Subscriber = require("../models/Subscriber");
const {sendConfirmationEmail} = require("./emailService");

const verificationCodes = new Map();

function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function hashEmail(email) {
    return crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
}

function encryptEmail(email) {
    try {
        const key = Buffer.from(process.env.ENCRYPTION_SECRET, 'hex');
        const iv = Buffer.from(process.env.EMAIL_ENCRYPTION_IV, 'hex');

        if (key.length !== 32 || iv.length !== 16) {
            const error = new Error("Encryption configuration invalid");
            error.statusCode = 500;
            throw error;
        }

        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(email, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    } catch (err) {
        console.error("[ENCRYPT EMAIL ERROR]:", err.message);
        const error = new Error("Failed to encrypt email");
        error.statusCode = 500;
        throw error;
    }
}

exports.sendCode = async (email) => {
    try {
        if (!email) return {status: 400, message: "Email is required."};

        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!isValid) return {status: 400, message: "Invalid email format."};

        const code = generateCode();
        verificationCodes.set(email, {
            code,
            expiresAt: Date.now() + 10 * 60 * 1000,
        });

        await sendConfirmationEmail(email, code);
        return {status: 200, message: "Verification code sent."};
    } catch (err) {
        console.error("[SEND CODE ERROR]:", err.message);
        const error = new Error("Failed to send verification code.");
        error.statusCode = 500;
        throw error;
    }
};

exports.verifyAndSubscribe = async (email, code) => {
    try {
        if (!email || !code) {
            return {status: 400, message: "Email and code are required."};
        }

        const entry = verificationCodes.get(email);
        if (!entry) return {status: 400, message: "No verification code found for this email."};
        if (entry.expiresAt < Date.now()) return {status: 400, message: "Verification code expired."};
        if (entry.code !== code.toUpperCase()) return {status: 400, message: "Invalid verification code."};

        const emailHash = hashEmail(email);
        const emailEncrypted = encryptEmail(email);

        const existing = await Subscriber.findOne({emailHash});
        if (existing) return {status: 409, message: "Email already subscribed."};

        const subscriber = new Subscriber({
            emailHash,
            emailEncrypted,
            confirmed: true,
            subscribedAt: new Date(),
        });
        await subscriber.save();

        verificationCodes.delete(email);

        return {status: 201, message: "Successfully subscribed!"};
    } catch (err) {
        console.error("[SUBSCRIBE ERROR]:", err.message);
        const error = new Error("Subscription process failed.");
        error.statusCode = 500;
        throw error;
    }
};

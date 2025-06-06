const crypto = require("crypto");
const Subscriber = require("../models/Subscriber");
const VerificationCode = require("../models/VerificationCode");
const {sendConfirmationEmail} = require("./emailService");

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
            throw new Error("Encryption configuration invalid");
        }

        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(email, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    } catch (err) {
        console.error("[ENCRYPT EMAIL ERROR]:", err.message);
        throw new Error("Failed to encrypt email");
    }
}

exports.sendCode = async (email) => {
    try {
        if (!email) return {status: 400, message: "Email is required."};

        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!isValid) return {status: 400, message: "Invalid email format."};

        const emailHash = hashEmail(email);
        const alreadySubscribed = await Subscriber.findOne({emailHash});
        if (alreadySubscribed) return {status: 409, message: "Email already subscribed."};

        const code = generateCode();

        await VerificationCode.findOneAndUpdate(
            {emailHash},
            {code, expiresAt: new Date(Date.now() + 10 * 60 * 1000)},
            {upsert: true}
        );

        await sendConfirmationEmail(email, code);
        return {status: 200, message: "Verification code sent."};
    } catch (err) {
        console.error("[SEND CODE ERROR]:", err.message);
        throw new Error("Failed to send verification code.");
    }
};

exports.verifyAndSubscribe = async (email, code) => {
    try {
        if (!email || !code) return {status: 400, message: "Email and code are required."};

        const emailHash = hashEmail(email);
        const record = await VerificationCode.findOne({emailHash});

        if (!record) return {status: 400, message: "No verification code found for this email."};
        if (record.expiresAt < new Date()) return {status: 400, message: "Verification code expired."};
        if (record.code !== code.toUpperCase()) return {status: 400, message: "Invalid verification code."};

        const emailEncrypted = encryptEmail(email);
        const existing = await Subscriber.findOne({emailHash});

        if (existing) return {status: 409, message: "Email already subscribed."};

        await new Subscriber({
            emailHash,
            emailEncrypted,
            confirmed: true,
            subscribedAt: new Date()
        }).save();

        await VerificationCode.deleteOne({emailHash});

        return {status: 201, message: "Successfully subscribed!"};
    } catch (err) {
        console.error("[SUBSCRIBE ERROR]:", err.message);
        throw new Error("Subscription process failed.");
    }
};

exports.getAll = async () => {
    return await Subscriber.find({}).lean();
};

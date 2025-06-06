const crypto = require("crypto");

function hashEmail(email) {
    try {
        if (!email || typeof email !== 'string') {
            const err = new Error('Invalid email for hashing');
            err.statusCode = 400;
            throw err;
        }

        const normalizedEmail = email.toLowerCase().trim();
        return crypto.createHash('sha256').update(normalizedEmail).digest('hex');
    } catch (err) {
        console.error(`[HASH ERROR] Failed to hash email: ${err.message}`);
        const error = new Error('Email hashing failed');
        error.statusCode = 500;
        throw error;
    }
}

module.exports = {hashEmail};

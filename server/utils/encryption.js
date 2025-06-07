const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const keyHex = process.env.ENCRYPTION_SECRET;
const ivHex = process.env.EMAIL_ENCRYPTION_IV;

// Validate config early
if (!keyHex || Buffer.from(keyHex, 'hex').length !== 32) {
    console.error('[CONFIG ERROR] ENCRYPTION_SECRET must be defined and exactly 32 bytes (64 hex chars)');
    process.exit(1);
}

if (!ivHex || Buffer.from(ivHex, 'hex').length !== 16) {
    console.error('[CONFIG ERROR] EMAIL_ENCRYPTION_IV must be defined and exactly 16 bytes (32 hex chars)');
    process.exit(1);
}

const secretKey = Buffer.from(keyHex, 'hex');

function encrypt(text) {
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (err) {
        console.error(`[ENCRYPTION ERROR] Failed to encrypt: ${err.message}`);
        const error = new Error('Encryption failed');
        error.statusCode = 500;
        throw error;
    }
}

function decrypt(encryptedData) {
    try {
        if (!encryptedData || typeof encryptedData !== 'string') {
            throw new Error('Invalid encrypted data format');
        }

        if (!encryptedData.includes(':')) {
            // Régi formátum – fix IV használatával próbáljuk visszafejteni
            const iv = Buffer.from(process.env.EMAIL_ENCRYPTION_IV, 'hex');
            const encryptedText = Buffer.from(encryptedData, 'hex');

            const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
            const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
            return decrypted.toString('utf8');
        }

        // Új formátum – iv:encrypted
        const [ivHex, encryptedHex] = encryptedData.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const encryptedText = Buffer.from(encryptedHex, 'hex');

        const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
        const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
        return decrypted.toString('utf8');
    } catch (err) {
        console.error(`[ENCRYPTION ERROR] Failed to decrypt: ${err.message}`);
        const error = new Error('Decryption failed');
        error.statusCode = 400;
        throw error;
    }
}

module.exports = {encrypt, decrypt};

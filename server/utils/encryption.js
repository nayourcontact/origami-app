const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = process.env.ENCRYPTION_SECRET;

if (!key || key.length !== 32) {
    throw new Error('ENCRYPTION_SECRET must be defined and exactly 32 characters long');
}

const secretKey = Buffer.from(key);

function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(encryptedData) {
    const [ivHex, encryptedHex] = encryptedData.split(':');
    if (!ivHex || !encryptedHex) {
        throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');

    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString('utf8');
}

module.exports = {encrypt, decrypt};

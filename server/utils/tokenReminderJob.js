const cron = require('node-cron');
const TokenModel = require('../models/InstagramToken');
const { sendTokenExpiryReminder } = require('../services/emailService'); // helyes path-ot állíts be
require('dotenv').config();

const checkTokenExpirations = async () => {
    try {
        const now = new Date();
        const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

        const expiringTokens = await TokenModel.find({
            expiresAt: { $lte: twoDaysFromNow, $gte: now }
        });

        for (const token of expiringTokens) {
            await sendTokenExpiryReminder({
                userId: token.userId,
                expiresAt: token.expiresAt,
            });
            console.log(`[REMINDER] Email sent for user: ${token.userId}`);
        }
    } catch (error) {
        console.error('[REMINDER JOB ERROR]:', error.message);
    }
};

//cron.schedule('0 1 * * *', () => {
    console.log('[REMINDER JOB] Running token expiration check...');
    checkTokenExpirations();
//});

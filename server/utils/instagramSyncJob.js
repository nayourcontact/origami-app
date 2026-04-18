const cron = require('node-cron');
const { fetchInstagramPosts } = require('../services/instagramPostService');
const InstagramToken = require('../models/InstagramToken'); // igazítsd a saját modelledhez

const runInstagramSyncForAllUsers = async () => {
    console.log('[INSTAGRAM SYNC] Started');

    try {
        const tokenRecords = await InstagramToken.find({}).lean();

        if (!tokenRecords.length) {
            console.log('[INSTAGRAM SYNC] No users/tokens found');
            return;
        }

        for (const tokenRecord of tokenRecords) {
            const userId = tokenRecord.userId;

            try {
                console.log(`[INSTAGRAM SYNC] Syncing user: ${userId}`);
                const result = await fetchInstagramPosts(userId);

                console.log(
                    `[INSTAGRAM SYNC] Done for user: ${userId} | fromCache=${result.fromCache} | count=${result.data?.length || 0}`
                );
            } catch (err) {
                console.error(`[INSTAGRAM SYNC] Failed for user: ${userId}`, err.message);
            }
        }

        console.log('[INSTAGRAM SYNC] Finished');
    } catch (err) {
        console.error('[INSTAGRAM SYNC] Global failure:', err.message);
    }
};

const startInstagramSyncJob = () => {
    console.log('[INSTAGRAM SYNC] Scheduling weekly job for Sunday 08:00');

    cron.schedule(
        '0 8 * * 0',
        async () => {
            await runInstagramSyncForAllUsers();
        },
        {
            timezone: 'Europe/Budapest'
        }
    );
};

const startInstagramSyncOnBoot = async () => {
    console.log('[INSTAGRAM SYNC] Running startup sync...');
    await runInstagramSyncForAllUsers();
};

module.exports = {
    startInstagramSyncJob,
    startInstagramSyncOnBoot,
    runInstagramSyncForAllUsers
};
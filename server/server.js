require('dotenv').config({ path: __dirname + '/.env' });
const { validateConfig } = require('./utils/config');
const log = require('./utils/logger');
let config;
try { config = validateConfig(); }
catch (err) { log.error('invalid_config', {reason:err.message}); process.exit(1); }
const mongoose = require('mongoose');
const app = require('./app');
const {setDraining} = require('./utils/health');
const {startInstagramSyncJob, startInstagramSyncOnBoot} = require('./utils/instagramSyncJob');
const {startTokenReminderJob} = require('./utils/tokenReminderJob');
let server;
let closing = false;
const jobs = [];
async function shutdown(signal) {
    if (closing) return;
    closing = true;
    setDraining(true);
    log.info('shutdown_start', {signal});
    const timeout = setTimeout(() => { log.error('shutdown_timeout'); process.exit(1); }, 15000);
    timeout.unref();
    try {
        for (const job of jobs) job?.stop?.();
        if (server) {
            server.closeIdleConnections?.();
            await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
        }
        await mongoose.disconnect();
        clearTimeout(timeout);
        log.info('shutdown_complete');
        process.exit(0);
    } catch(err) { log.error('shutdown_failed', {reason:err.message}); process.exit(1); }
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', err => { log.error('unhandled_rejection', {reason:String(err)}); shutdown('unhandledRejection'); });
process.on('uncaughtException', err => { log.error('uncaught_exception', {reason:err.message}); shutdown('uncaughtException'); });
(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {serverSelectionTimeoutMS: 10000});
        log.info('mongodb_connected');
        server = app.listen(config.port, config.host, () => log.info('server_listening', {host:config.host, port:config.port}));
        jobs.push(startInstagramSyncJob());
        jobs.push(startTokenReminderJob());
        startInstagramSyncOnBoot().catch(err => log.error('instagram_sync_failed', {reason:err.message}));
    } catch(err) {log.error('startup_failed', {reason:err.message}); process.exit(1);}
})();

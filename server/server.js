require('dotenv').config({ path: __dirname + '/.env' });
const { validateConfig } = require('./utils/config');
try {
    validateConfig();
} catch (error) {
    console.error('[CONFIG] Startup aborted:', error.message);
    process.exit(1);
}
const mongoose = require("mongoose");
const app = require("./app");
const {
    startInstagramSyncJob,
    startInstagramSyncOnBoot
} = require("./utils/instagramSyncJob");

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");

        app.listen(PORT, '127.0.0.1', () => {
            console.log(`Server running on 127.0.0.1:${PORT}`);

            startInstagramSyncJob();

            startInstagramSyncOnBoot().catch(err => {
                console.error("[INSTAGRAM SYNC] Startup sync failed:", err.message);
            });
        });
    })
    .catch(err => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });
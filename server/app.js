const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");
const routes = require("./routes");
const errorHandler = require("./utils/errorHandler");

require('./utils/tokenReminderJob');

const app = express();

const { BASE_UPLOAD_ROOT } = require('./utils/uploadPaths');

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
    origin: [process.env.CLIENT_ORIGIN],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}));
app.use(express.json());
// Only explicitly public media directories are served. Other uploads remain private.
const publicMediaOptions = { dotfiles: 'deny', index: false, fallthrough: false,
    setHeaders: res => { res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox"); } };
app.use('/uploads/events', express.static(path.join(BASE_UPLOAD_ROOT, 'events'), publicMediaOptions));
app.use('/uploads/instagram', express.static(path.join(BASE_UPLOAD_ROOT, 'instagram'), publicMediaOptions));
app.set('trust proxy', 1);

// Rate limiter (global)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { message: "Too many requests. Please try again later." }
});
app.use(globalLimiter);

// Routes
app.use("/api", routes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");
const routes = require("./routes");
const errorHandler = require("./utils/errorHandler");

require('./utils/tokenReminderJob');

const app = express();

const BASE_UPLOAD_ROOT =
    process.platform === 'win32'
        ? 'C:/origami_app/uploads'
        : '/home/app/origami_app/uploads';

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
app.use('/uploads', express.static(BASE_UPLOAD_ROOT));
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

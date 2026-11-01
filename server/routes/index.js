// Collector for routes
const express = require("express");
const router = express.Router();
const instagramRoutes = require("./instagramTokenRoutes");
const biographyRoutes = require("./biographyRoutes");
const postsRoutes = require("./postRoutes");
const subscriberRoutes = require("./subscriberRoutes");
const orderRoutes = require("./orderRoutes");
const rateLimit = require("express-rate-limit");
const adminRoutes = require("./adminRoutes");
const eventRoutes = require("./eventRoutes");
const linkPreviewRoutes = require("./linkPreviewRoutes");

// Newsletter-specific rate limiter
const newsletterLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {message: "Too many attempts."}
});

const linkPreviewLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    message: {
        message: "Too many link preview requests."
    }
});

router.use("/biography", biographyRoutes);
router.use("/posts", postsRoutes);
router.use("/order", orderRoutes);
router.use("/newsletter", newsletterLimiter, subscriberRoutes);
router.use("/admin", adminRoutes);
router.use("/events", eventRoutes);
router.use("/", instagramRoutes);
router.use(
    "/link-preview",
    linkPreviewLimiter,
    linkPreviewRoutes
);
module.exports = router;

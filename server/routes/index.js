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

// Newsletter-specific rate limiter
const newsletterLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {message: "Too many attempts."}
});

router.use("/biography", biographyRoutes);
router.use("/posts", postsRoutes);
router.use("/order", orderRoutes);
router.use("/newsletter", newsletterLimiter, subscriberRoutes);
router.use("/", instagramRoutes);
router.use("/admin", adminRoutes);

module.exports = router;

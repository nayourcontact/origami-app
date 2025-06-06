const express = require("express");
const router = express.Router();
const subscriberController = require("../controllers/subscriberController");
const rateLimit = require("express-rate-limit");

const sendCodeLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { message: "📨 Túl sok kódkérés. Próbáld meg később." }
});

router.post("/send-code", sendCodeLimiter, subscriberController.sendCode);
router.post("/subscribe", subscriberController.subscribe);

module.exports = router;

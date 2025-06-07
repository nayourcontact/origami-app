const express = require("express");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const subscriberController = require("../controllers/subscriberController");

const router = express.Router();

// Rate limiter a kódkérésre
const sendCodeLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { message: "📨 Túl sok kódkérés. Próbáld meg később." }
});

// Validációs hibák kezelése
function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

// POST /send-code
router.post(
    "/send-code",
    sendCodeLimiter,
    [
        body("email")
            .isEmail().withMessage("Érvényes email szükséges.")
            .normalizeEmail()
    ],
    handleValidationErrors,
    subscriberController.sendCode
);

// POST /subscribe
router.post(
    "/subscribe",
    [
        body("email")
            .isEmail().withMessage("Érvényes email szükséges.")
            .normalizeEmail(),
        body("code")
            .isLength({ min: 6, max: 6 }).withMessage("A kód pontosan 6 karakter legyen.")
            .isAlphanumeric().withMessage("A kód csak betűt és számot tartalmazhat.")
    ],
    handleValidationErrors,
    subscriberController.subscribe
);

module.exports = router;

const express = require("express");
const { body, validationResult } = require("express-validator");
const sanitizeHtml = require("sanitize-html");
const orderController = require("../controllers/orderController");

const router = express.Router();

// Validációs hibaellenőrző middleware
function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

// POST /order
router.post(
    "/",
    [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Név megadása kötelező."),

        body("email")
            .isEmail()
            .withMessage("Érvényes email szükséges.")
            .normalizeEmail(),

        body("details")
            .trim()
            .notEmpty()
            .withMessage("A rendelés leírása kötelező."),

        body("notes")
            .optional({ checkFalsy: true })
            .trim()
            .customSanitizer(value => sanitizeHtml(value))
    ],
    handleValidationErrors,
    orderController.createOrder
);

module.exports = router;

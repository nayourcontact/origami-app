const express = require('express');
const { body, param, validationResult } = require('express-validator');
const controller = require('../controllers/instagramTokenController');

const router = express.Router();

// Hibaellenőrző middleware
function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

// POST /token – Token mentése
router.post(
    '/token',
    [
        body("token").isString().notEmpty().withMessage("Token is required."),
        body("expiresAt").isISO8601().withMessage("expiresAt must be a valid ISO date."),
        body("userId").isString().notEmpty().withMessage("userId is required."),
        body("clientSecret").isString().notEmpty().withMessage("clientSecret is required.")
    ],
    handleValidationErrors,
    controller.saveToken
);

// GET /token/:userId – Token lekérdezése
router.get(
    '/token/:userId',
    [
        param("userId").isString().notEmpty().withMessage("userId paraméter hiányzik.")
    ],
    handleValidationErrors,
    controller.getToken
);

// POST /token/refresh – Token frissítése
router.post(
    '/token/refresh',
    [
        body("userId").isString().notEmpty().withMessage("userId is required.")
    ],
    handleValidationErrors,
    controller.refreshToken
);

// GET /token/validate/:userId – Token érvényességének ellenőrzése
router.get(
    '/token/validate/:userId',
    [
        param("userId").isString().notEmpty().withMessage("userId paraméter hiányzik.")
    ],
    handleValidationErrors,
    controller.validateToken
);

module.exports = router;

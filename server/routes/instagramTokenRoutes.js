const express = require('express');
const { body, param, validationResult } = require('express-validator');
const controller = require('../controllers/instagramTokenController');
const auth = require('../utils/authMiddleware');
const requireAdmin = require('../utils/requireAdmin');

const router = express.Router();

// Hibaellenőrző middleware
function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

// Minden tokenkezelő végpont admin jogosultsághoz kötött.
router.use(auth, requireAdmin);

// POST /token – Token mentése
router.post(
    '/token',
    [
        body("token").isString().notEmpty().withMessage("Token is required."),
        body("expiresAt").isISO8601().withMessage("expiresAt must be a valid ISO date."),
        body("userId").isString().notEmpty().withMessage("userId is required."),
        body("clientSecret").not().exists().withMessage("clientSecret nem küldhető a kliensről.")
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

const express = require("express");
const { body, param, query, validationResult } = require("express-validator");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../utils/authMiddleware");
const requireAdmin = require("../utils/requireAdmin");
const loginLimiter = require("../utils/loginLimiter");
const eventRoutes = require("./eventRoutes");
const { trustedOrigin } = require("../utils/adminSession");

// Validációs hibaellenőrző middleware
function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

// 🟢 Nyilvános végpontok

router.post(
    "/login",
    loginLimiter,
    (req, res, next) => trustedOrigin(req) ? next() : res.status(403).json({message: "Origin tiltva."}),
    [
        body("email").isEmail().withMessage("Érvényes email szükséges.").normalizeEmail(),
        body("password").isLength({ min: 6 }).withMessage("A jelszónak legalább 6 karakter hosszúnak kell lennie.")
    ],
    handleValidationErrors,
    adminController.login
);

router.post(
    "/register",
    (req, res, next) => trustedOrigin(req) ? next() : res.status(403).json({message: "Origin tiltva."}),
    [
        body("email").isEmail().withMessage("Érvényes email szükséges.").normalizeEmail(),
        body("password").isLength({ min: 6 }).withMessage("A jelszónak legalább 6 karakter hosszúnak kell lennie.")
    ],
    handleValidationErrors,
    adminController.register
);

// 🟠 Auth alatti, védett végpontok

router.use(auth, requireAdmin);
router.get('/me', adminController.me);
router.get('/session', requireAdmin, adminController.session);
router.post('/logout', requireAdmin, adminController.logout);
router.use("/events", requireAdmin, eventRoutes);

router.put(
    "/email",
    [
        body("newEmail").isEmail().withMessage("Érvényes új email szükséges.").normalizeEmail()
    ],
    handleValidationErrors,
    adminController.updateEmail
);

router.get(
    "/status",
    [
        query("userId").notEmpty().withMessage("A userId megadása kötelező.")
    ],
    handleValidationErrors,
    requireAdmin,
    adminController.statusCheck
);

router.get(
    "/language/:locale",
    [
        param("locale").isAlpha().isLength({ min: 2, max: 5 }).withMessage("Helyes nyelvi kód szükséges (pl. hu, en).")
    ],
    handleValidationErrors,
    adminController.getLanguageFile
);

router.put(
    "/language/:locale",
    [
        param("locale").isAlpha().isLength({ min: 2, max: 5 }),
        body().isObject().notEmpty().withMessage("A nyelvi fájl nem lehet üres.")
    ],
    handleValidationErrors,
    adminController.saveLanguageFile
);

router.get("/gdpr-export", adminController.getGdprExport);
router.get("/orders", adminController.listOrders);

module.exports = router;

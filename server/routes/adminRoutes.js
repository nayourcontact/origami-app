const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../utils/authMiddleware");
const loginLimiter = require("../utils/loginLimiter");

// Nyilvános végpontok
router.post("/login", loginLimiter, adminController.login);
router.post("/register", adminController.register);

// Minden innen lefelé védett: csak érvényes JWT-vel rendelkező admin érheti el
router.use(auth);

router.put("/email", adminController.updateEmail);
router.get("/status", adminController.statusCheck);
router.get("/language/:locale", adminController.getLanguageFile);
router.put("/language/:locale", adminController.saveLanguageFile);
router.get("/gdpr-export", adminController.getGdprExport);

module.exports = router;

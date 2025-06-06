const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../utils/authMiddleware");

// Nyilvános végpontok
router.post("/login", adminController.login);
router.post("/register", adminController.register);

router.use(auth);

router.put("/email", adminController.updateEmail);
router.get("/status", adminController.statusCheck);
router.get("/language/:locale", adminController.getLanguageFile);
router.put("/language/:locale", adminController.saveLanguageFile);

module.exports = router;

// routes/refreshRoutes.js
const express = require("express");
const router = express.Router();
const { refreshInstagramToken } = require("../controllers/refreshController");

router.get("/refresh-token", refreshInstagramToken);

module.exports = router;

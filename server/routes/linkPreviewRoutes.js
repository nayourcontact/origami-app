const express = require("express");
const router = express.Router();

const {
    getLinkPreview
} = require("../controllers/linkPreviewController");

router.get("/", getLinkPreview);

module.exports = router;
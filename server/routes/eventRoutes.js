const express = require("express");
const router = express.Router();

const upload = require("../utils/upload");
const auth = require("../utils/authMiddleware");
const requireAdmin = require("../utils/requireAdmin");
const eventController = require("../controllers/eventController");

router.get("/", eventController.getEvents);

router.post(
    "/",
    auth,
    requireAdmin,
    upload.fields([
        {name: "coverImage", maxCount: 1},
        {name: "gallery", maxCount: 30},
    ]),
    eventController.createEvent
);

router.post(
    "/:id/gallery",
    auth,
    requireAdmin,
    upload.array("gallery", 30),
    eventController.uploadGallery
);

router.delete("/:id", auth, requireAdmin, eventController.deleteEvent);

module.exports = router;
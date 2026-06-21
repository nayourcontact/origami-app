const express = require("express");
const router = express.Router();

const upload = require("../utils/upload");
const eventController = require("../controllers/eventController");

// később ide jöhet auth middleware is
router.get("/", eventController.getEvents);

router.post(
    "/",
    upload.fields([
        { name: "coverImage", maxCount: 1 },
        { name: "gallery", maxCount: 30 },
    ]),
    eventController.createEvent
);

router.post(
    "/:id/gallery",
    upload.array("gallery", 30),
    eventController.uploadGallery
);

router.delete("/:id", eventController.deleteEvent);

module.exports = router;
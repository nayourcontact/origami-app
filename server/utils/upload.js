const multer = require("multer");
const path = require("path");
const fs = require("fs");

const BASE_UPLOAD_ROOT =
    process.platform === "win32"
        ? "C:/origami_app/uploads"
        : "/home/app/origami_app/uploads";

const uploadDir = path.join(BASE_UPLOAD_ROOT, "events");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
        cb(null, true);
    } else {
        cb(new Error("Csak kép vagy videó tölthető fel."), false);
    }
};

module.exports = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
});
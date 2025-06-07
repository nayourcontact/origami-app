const express = require('express');
const { param, query, validationResult } = require("express-validator");
const {
    getPosts,
    getImagePosts,
    getVideoPosts,
    deleteAllPosts
} = require('../controllers/instagramPostController');

const router = express.Router();

// Hibaellenőrző middleware
function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

// GET /:userId?page=1&limit=12
router.get(
    '/:userId',
    [
        param("userId").isString().notEmpty().withMessage("userId is required."),
        query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer."),
        query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100.")
    ],
    handleValidationErrors,
    getPosts
);

// GET /images/:userId
router.get(
    '/images/:userId',
    [
        param("userId").isString().notEmpty()
    ],
    handleValidationErrors,
    getImagePosts
);

// GET /videos/:userId
router.get(
    '/videos/:userId',
    [
        param("userId").isString().notEmpty()
    ],
    handleValidationErrors,
    getVideoPosts
);

// DELETE /all — csak akkor ajánlott, ha védelem alatt van!
router.delete('/all', deleteAllPosts);

module.exports = router;

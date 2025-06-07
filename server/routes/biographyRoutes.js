const express = require('express');
const {param, validationResult} = require("express-validator");
const router = express.Router();
const {getBiography} = require('../controllers/biographyController');

// Validációs middleware
function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    next();
}

// Route a validációval
router.get(
    '/:id',
    param('id')
        .isLength({min: 3}).withMessage("User ID túl rövid.")
        .isAlphanumeric().withMessage("User ID csak betűket és számokat tartalmazhat."),
    handleValidationErrors,
    getBiography
);

module.exports = router;

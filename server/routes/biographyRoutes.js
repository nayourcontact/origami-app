const express = require('express');
const router = express.Router();
const { getBiography } = require('../controllers/biographyController');

router.get('/:id', getBiography);

module.exports = router;

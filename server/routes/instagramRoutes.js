const express = require('express');
const router = express.Router();
const { getInstagramProfile } = require('../controllers/instagramController');

router.get('/instagram-profile', getInstagramProfile);

module.exports = router;

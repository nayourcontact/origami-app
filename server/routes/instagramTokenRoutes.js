const express = require('express');
const router = express.Router();
const controller = require('../controllers/instagramTokenController');

router.post('/token', controller.saveToken);
router.get('/token/:userId', controller.getToken);
router.post('/token/refresh', controller.refreshToken);
router.get('/token/validate/:userId', controller.validateToken);

module.exports = router;

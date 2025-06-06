const express = require('express');
const router = express.Router();
const subscriberController = require('../controllers/subscriberController');

router.post('/subscribe', subscriberController.subscribe);
router.post('/send-code', subscriberController.sendCode);

module.exports = router;

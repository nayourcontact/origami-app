const express = require('express');
const router = express.Router();
const { getPosts, getImagePosts, getVideoPosts, deleteAllPosts } = require('../controllers/instagramPostController');

router.get('/:userId', getPosts);
router.get('/images/:userId', getImagePosts);
router.get('/videos/:userId', getVideoPosts);
router.delete('/all', deleteAllPosts);

module.exports = router;

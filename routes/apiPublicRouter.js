const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');

// posts
router.get('/posts', postController.get_posts);
router.get('/posts/:postId', postController.get_post);

// comments
router.get('/posts/:postId/comments', commentController.get_comments);
router.post('/posts/:postId/comments', commentController.create_comment);

module.exports = router;
const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const { validateMongooseId } = require('../utils/validator');

// posts
router.get('/posts', postController.get_posts);
router.get('/posts/:postId', validateMongooseId, postController.get_post);

// comments
router.get('/posts/:postId/comments', validateMongooseId, commentController.get_comments);
router.post('/posts/:postId/comments', validateMongooseId, commentController.create_comment);

module.exports = router;
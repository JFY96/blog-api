const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');

// users
router.get('/users', userController.get_user_list);
router.get('/users/:userId', userController.get_user);

// posts
router.post('/posts', postController.create_post);
router.put('/posts/:postId', postController.update_post);
router.delete('/posts/:postId', postController.delete_post);

// comments
router.get('/posts/:postId/comments/:commentId', commentController.get_comment);
router.put('/posts/:postId/comments/:commentId', commentController.update_comment);
router.delete('/posts/:postId/comments/:commentId', commentController.delete_comment);

module.exports = router;
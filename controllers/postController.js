const { body, query } = require('express-validator');

const PostService = require('../services/postService');
const { checkReqUser, checkAdminUser, validateErrors } = require('../utils/validator');

const PostServiceInstance = new PostService();

// validator - only allow user who created post, or admin to modify
const userValidator = async (req, res, next) => {
	if (req.params.postId === undefined) return next();
	const post = await PostServiceInstance.getPost(req.params.postId).catch(err => next(err));
	if (!post) return res.status(422).json({
		success: false,
		error: 'Post does not exist',
	});
	return checkReqUser(req, res, next, post.user);
};

exports.get_posts = [
	query('admin')
		.toBoolean(true),
	async (req, res, next) => {
		const admin = req.query.admin ?? false;
		return checkAdminUser(req, res, next, admin);
	},
	async (req, res, next) => {
		try {
			const admin = req.query.admin ?? false;
			const posts = await PostServiceInstance.getPosts(admin);
			return res.json({
				success: true,
				posts,
			});
		} catch(err) {
			return next(err);
		}
	}
];

exports.get_post = async (req, res, next) => {
	try {
		const post = await PostServiceInstance.getPost(req.params.postId);
		return res.json({
			success: true,
			post,
		});
	} catch(err) {
		return next(err);
	}
};

exports.create_post = [
	body('title')
		.trim()
		.notEmpty()
		.escape()
		.withMessage('title is required'),
	body('content')
		.trim()
		.notEmpty()
		.escape()
		.withMessage('content is required'),
	validateErrors,
	async (req, res, next) => {
		try {
			const updatedPost = await PostServiceInstance.createPost(req.body, req.user);
			return res.json({
				success: true,
				post: updatedPost,
			});
		} catch(err) {
			return next(err);
		}
	},
];

// validation - only allow user who created post, or admin to update
exports.update_post = [
	userValidator,
	body('title')
		.optional()
		.trim()
		.escape(),
	body('content')
		.optional()
		.trim()
		.escape(),
	body('published')
		.optional()
		.toBoolean(),
	validateErrors,
	async (req, res, next) => {
		try {
			const result = await PostServiceInstance.updatePost(req.params.postId, req.body);
			return res.json({
				success: result.acknowledged,
			});
		} catch(err) {
			return next(err);
		}
	},
];

exports.delete_post = [
	userValidator,
	async (req, res, next) => {
		try {
			await PostServiceInstance.deletePost(req.params.postId);
			return res.json({
				success: true,
				postId: req.params.postId,
			});
		} catch(err) {
			return next(err);
		}
	},
];
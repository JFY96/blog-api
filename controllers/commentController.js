const { body } = require('express-validator');

const CommentService = require('../services/commentService');
const { checkReqUser, validateErrors, validatePost } = require('../utils/validator');

const CommentServiceInstance = new CommentService();

const userValidator = async (req, res, next) => {
	if (req.params.commentId === undefined) return next();
	const comment = await CommentServiceInstance.getComment(req.params.commentId).catch(err => next(err));
	if (!comment) return res.status(422).json({
		error: 'Comment does not exist',
	});
	return checkReqUser(req, res, next, comment.user);
};

exports.get_comments = [
	validatePost,
	async (req, res, next) => {
		try {
			const orderBy = req.query.order_by ?? '';
			const comments = await CommentServiceInstance.getComments(req.params.postId, orderBy);
			return res.json({
				success: true,
				comments,
			});
		} catch (e) {
			return next(e);
		}
	}
];

exports.get_comment = async (req, res, next) => {
	try {
		const comment = await CommentServiceInstance.getComment(req.params.commentId);
		return res.json({
			success: true,
			comment,
		});
	} catch (e) {
		return next(e);
	}
};

exports.create_comment = [
	validatePost,
	body('name')
		.trim(),
	body('content')
		.trim()
		.notEmpty()
		.withMessage('Comment must not be blank'),
	validateErrors,
	async (req, res, next) => {
		try {
			const name = req.user ? req.user.username : req.body.name ?? '';
			const comment = await CommentServiceInstance.createComment(req.params.postId, req.user._id, name, req.body.content);
			return res.json({
				success: true,
				comment,
			});
		} catch (e) {
			return next(e);
		}
	},
];


exports.update_comment = [
	body('content')
		.trim()
		.notEmpty()
		.withMessage('Comment must not be blank'),
	validateErrors,
	userValidator,
	async (req, res, next) => {
		try {
			await CommentServiceInstance.updateComment(req.params.commentId, req.body.content);
			return res.json({
				success: true,
			});
		} catch (e) {
			return next(e);
		}
	},
];

exports.delete_comment = [
	userValidator,
	async (req, res, next) => {
		try {
			await CommentServiceInstance.deleteComment(req.params.commentId);
			return res.json({
				success: true,
			});
		} catch (e) {
			return next(e);
		}
	},
];
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const PostService = require('../services/postService');

// validation to only allow user who owns a resource, or an admin to modify
const checkReqUser = (req, res, next, user) => {
	if (!req.user.admin && (!user || !req.user || user.toString() !== req.user._id.toString())) {
		return res.status(401).json({
			success: false,
			error: 'User not authorized',
		});
	}
	return next();
};

const checkAdminUser = (req, res, next, adminRequired = true) => {
	if (adminRequired && !req.user.admin) return res.status(401).json({
		success: false,
		error: 'User not authorized',
	});
	return next();
};

const validateErrorsWithCustomHTTPStatus = (httpStatus) => (req, res, next) => {
	const errors = validationResult(req);
	if (errors.isEmpty()) {
		return next();
	}

	const extractedErrors = errors.array().reduce((accum, err) => {
		accum[err.param] = err.msg;
		return accum;
	}, {});

	return res.status(httpStatus).json({
		success: false,
		errors: extractedErrors,
	});
};

const validateErrors = validateErrorsWithCustomHTTPStatus(422); // 422 UNPROCESSABLE ENTITY

// Use to validate routes that use a MongoDB ID
const validateMongooseId = (req, res, next) => {
	const idsToCheck = ['postId', 'commentId', 'userId'];
	const valid = idsToCheck.reduce((prevValid, current) => {
		if (!prevValid) return false;
		if (req?.params?.[current] !== undefined) {
			prevValid = mongoose.Types.ObjectId.isValid(req?.params?.[current]);
		}
		return prevValid;
	}, true);

	if (valid) {
		return next();
	}
	
	return res.status(422).json({
		success: true,
		error: 'Invalid Id Provided',
	});
};

const validatePost = async (req, res, next) => {
	const postId = req.params?.postId ?? '';
	if (!postId) return next();

	const PostServiceInstance = new PostService();
	const post = await PostServiceInstance.getPost(postId);
	if (!post) {
		return res.status(422).json({
			success: false,
			error: 'Post does not exist',
		});
	} else if (!post.published) {
		// Check User is admin or owns post
		const userId = req.user?._id ? req.user?._id.toString() : '';
		const admin = !!req.user?.admin;
		if (!admin && (!userId || userId !== post.user.toString())) {
			return res.status(401).json({
				success: false,
				error: 'User not authorized for this post',
			});
		}
	}
	return next();
};

module.exports = {
	checkReqUser,
	checkAdminUser,
	validateErrorsWithCustomHTTPStatus,
	validateErrors,
	validateMongooseId,
	validatePost,
};
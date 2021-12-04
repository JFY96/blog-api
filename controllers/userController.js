const bcrypt = require('bcryptjs');
const { body } = require('express-validator');

const User = require('../models/user');
const UserService = require('../services/userService');
const { authLocal, refreshToken, removeToken } = require('../utils/auth');
const { validateErrorsWithCustomHTTPStatus, validateErrors } = require('../utils/validator');

const UserServiceInstance = new UserService();

exports.get_user_list = async (req, res, next) => {
	try {
		const users = await UserServiceInstance.getUsers();
		return res.json({
			success: true,
			users,
		});
	} catch (e) {
		return next(e);
	}
};

exports.get_user = async (req, res, next) => {
	try {
		const user = await UserServiceInstance.getUser(req.params.userId);
		return res.json({
			success: true,
			user,
		});
	} catch (e) {
		return next(e);
	}
};

exports.signup = [
	// Basic validation and Sanitization
	body('username')
		.trim()
		.isLength({ min: 5 })
		.escape()
		.withMessage('username must be at least 5 characters long')
		.isAlphanumeric()
		.withMessage('username must only contain alphanumeric characters'),
	body('password')
		.trim()
		.isLength({ min: 6 })
		.escape()
		.withMessage('password must be at least 6 characters long')
		.isAlphanumeric()
		.withMessage('password must only contain alphanumeric characters'),
	validateErrors,
	// Check for existing username
	body('username')
		.custom((username) => {
			return User.findOne({ username })
				.then(user => {
					if (user) throw new Error('username already exists');
				})
				.catch(err => {
					throw new Error(err);
				});
		}),
	validateErrorsWithCustomHTTPStatus(409),
	(req, res, next) => {
		// no errors, hash password and create user
		bcrypt.hash(req.body.password, 10)
			.then((encrypted) => {
				const user = new User({
					username: req.body.username,
					password: encrypted,
				});
				user.save()
					.then(() => {
						res.json({
							success: true,
							username: user.username,
						});
					})
					.catch(err => next(err));
			})
			.catch(err => next(err));
	}
];

exports.login = authLocal;

exports.refreshToken = refreshToken;

exports.logout = removeToken;


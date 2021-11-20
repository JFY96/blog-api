const passport = require('passport');
const jwt = require('jsonwebtoken');
const uniqid = require('uniqid');

const User = require('../models/user');

const refreshTokens = new Map();

const jwtSign = (res, user) => {
	const payload = {
		user_id: user._id,
		expires: Date.now() + parseInt(process.env.JWT_EXPIRATION_MS),
	};
	// generate a signed json web token
	jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION_MS.toString() }, (signErr, token) => {
		if (signErr) {
			return res.status(401).json({
				success: false,
				error: 'Could not generate token for user',
			});
		}
		const refreshToken = uniqid(); // TODO expire token and remove from map when no longer valid?
		refreshTokens.set(refreshToken, user._id.toString());
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			// expires: Date.now() + parseInt(process.env.REFRESH_TOKEN_EXPIRATION_MS),
		});
		res.json({
			success: true,
			user: user.username,
			expires: payload.expires,
			token,
		});
	});
}

exports.authLocal = (req, res, next) => passport.authenticate(
	'local',
	{ session: false },
	(err, user) => {
		if (err || !user){
			return res.status(401).json({
				success: false,
				error: err || 'User details required',
			});
		}

		// req.logIn(user, (error) => {
		req.logIn(user, {session: false}, (error) => {
			if (error) {
				return res.status(401).json({
					success: false,
					error: 'Could not log in user',
				});
			}
			jwtSign(res, user);
		});
	}
)(req, res, next);

exports.refreshToken = async (req, res, next) => {
	if (!req.cookies.refreshToken) {
		return res.status(422).json({
			success: false,
			error: 'No refresh token provided'
		});
	}
	try {
		const userId = refreshTokens.get(req.cookies.refreshToken);
		refreshTokens.delete(req.cookies.refreshToken);
		const user = await User.findById(userId);
		if (!user) {
			return res.status(401).json({
				success: false,
				error: 'Invalid refresh token provided'
			});
		}
		jwtSign(res, user);
	} catch (e) {
		return next(e);
	}
};

exports.authJWT = (req, res, next) => passport.authenticate(
	'jwt', 
	{ session: false },
	(err, user) => {
		req.user = user;
		if (err || !user) {
			return res.status(401).json({
				success: false,
				error: err || 'Could not verify token',
			});
		}
		return next();
	}
)(req, res, next);

exports.authJWTPublic = (req, res, next) => passport.authenticate(
	'jwt', 
	{ session: false },
	(err, user) => {
		req.user = user;
		if (err || !user) {
			req.publicUser = true;
		}
		return next();
	}
)(req, res, next);
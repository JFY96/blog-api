const passport = require('passport');
const jwt = require('jsonwebtoken');
const uniqid = require('uniqid');

const User = require('../models/user');

const refreshTokens = new Map();
const refreshTokensExpiry = new Map();

const deleteRefreshToken = (res, token) => {
	refreshTokens.delete(token);
	refreshTokensExpiry.delete(token);
	res.clearCookie('refreshToken');
};

const refreshTokenExpired = (token) => {
	return (Date.now() >= refreshTokensExpiry.get(token));
};

const jwtSign = (req, res, user, freshLogin = false) => {
	const payload = {
		user_id: user._id,
		expires: Date.now() + parseInt(process.env.JWT_EXPIRATION_MS),
		freshLogin,
	};
	// generate a signed json web token
	jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION_MS.toString() }, (signErr, token) => {
		if (signErr) {
			return res.status(401).json({
				success: false,
				error: 'Could not generate token for user',
			});
		}

		// Handle Refresh Token
		if (req.cookies?.refreshToken && (payload.freshLogin || refreshTokenExpired(req.cookies.refreshToken))) {
			deleteRefreshToken(res, req.cookies.refreshToken);
		}
		if (!req.cookies?.refreshToken || payload.freshLogin) {
			const refreshToken = uniqid();
			const expiry = Date.now() + parseInt(process.env.REFRESH_TOKEN_EXPIRATION_MS);
			refreshTokens.set(refreshToken, user._id.toString());
			refreshTokensExpiry.set(refreshToken, expiry);
			res.cookie('refreshToken', refreshToken, {
				httpOnly: true,
				expiry,
			});
		}

		res.json({
			success: true,
			user: user.username,
			userId: user._id.toString(),
			admin: user.admin,
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
			jwtSign(req, res, user, true);
		});
	}
)(req, res, next);

exports.refreshToken = async (req, res, next) => {
	if (!req.cookies.refreshToken) {
		return res.status(422).json({
			success: false,
			errorCode: 'A001',
			error: 'No refresh token provided'
		});
	}
	try {
		if (refreshTokenExpired(req.cookies.refreshToken)) {
			deleteRefreshToken(res, req.cookies.refreshToken);
			return res.status(401).json({
				success: false,
				errorCode: 'A002',
				error: 'Refresh token expired'
			});
		}
		const userId = refreshTokens.get(req.cookies.refreshToken);
		const user = await User.findById(userId);
		if (!user) {
			return res.status(401).json({
				success: false,
				errorCode: 'A003',
				error: 'Invalid refresh token provided'
			});
		}
		jwtSign(req, res, user);
	} catch (e) {
		return next(e);
	}
};

exports.removeToken = async (req, res, next) => {
	deleteRefreshToken(res, req.cookies.refreshToken);
	return res.json({
		success: true,
		error: '',
	});
}

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
const passport = require('passport');
const jwt = require('jsonwebtoken');

exports.authLocal = (req, res, next) => passport.authenticate(
	'local',
	{ session: false },
	(err, user) => {
		if (err || !user){
			return res.status(400).json({
				msg: err || 'Could not authenticate user',
			});
		}

		const payload = {
			user_id: user._id,
			expires: Date.now() + parseInt(process.env.JWT_EXPIRATION_MS),
		};

		req.logIn(user, {session: false}, (error) => {
			if (error) {
				return res.status(400).json({
					msg: 'Could not log in user',
				});
			}
			// generate a signed json web token
			jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION_MS.toString() } ,(signErr, token) => {
				if (signErr) {
					return res.status(400).json({
						msg: 'Could not generate token for user',
					});
				}
				res.json({
					user: user.username,
					expires: payload.expires,
					token,
				});
			});
		});
	}
)(req, res, next);

exports.authJWT = (req, res, next) => passport.authenticate(
	'jwt', 
	{ session: false },
	(err, user) => {
		req.user = user;
		if (err || !user) {
			return res.status(400).json({
				msg: err || 'Could not verify token',
			});
		}
		return next();
	}
)(req, res, next);
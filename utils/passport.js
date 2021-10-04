const bcrypt = require('bcryptjs');
const passport = require('passport');
const { Strategy:LocalStrategy } = require("passport-local");
const { Strategy:JWTStrategy, ExtractJwt } = require("passport-jwt");

const User = require('../models/user');

// user/password strategy
passport.use(
	new LocalStrategy((username, password, done) => {
		User.findOne({ username })
			.then(user => {
				if (!user) return done('Incorrect username', null); // user not found
				bcrypt.compare(password, user.password, (err, res) => {
					if (res) { // passwords match! log user in
						return done(null, user);
					} else { // passwords do not match!
						return done('Incorrect password', null);
					}
				});
			})
			.catch(err => done(err));
	})
);

// JWT strategy
passport.use(
	new JWTStrategy(
		{
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.JWT_SECRET,
		},
		(jwtPayload, done) => {
			if (Date.now() > jwtPayload.expires) {
				return done('Token expired');
			}
			
			User.findOne({ _id: jwtPayload.user_id })
				.then(user => done(null, user))
				.catch(err => done(err));
		}
	)
);
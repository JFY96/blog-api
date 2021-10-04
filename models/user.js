const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	date_registered: {
		type: Date,
		default: Date.now(),
	},
	admin: {
		type: Boolean,
		default: false,
	},
});

module.exports = mongoose.model('User', UserSchema);
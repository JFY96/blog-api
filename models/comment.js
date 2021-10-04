const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
	post: {
		type: Schema.Types.ObjectId,
		ref: 'Post',
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	timestamp: {
		type: Date,
		default: Date.now(),
	},
});

module.exports = mongoose.model('Comment', CommentSchema);
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
	title: {
		type: String,
		required: true,
		maxlength: 200,
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
	private: {
		type: Boolean,
		default: true,
	},
});

module.exports = mongoose.model('Post', PostSchema);
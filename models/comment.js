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
	name: {
		type: String,
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

CommentSchema.set('toObject', { virtuals: true });
CommentSchema.set('toJSON', { virtuals: true });

CommentSchema
	.virtual('unixTimestamp')
	.get(function() {
		return this.timestamp.getTime();
	});

module.exports = mongoose.model('Comment', CommentSchema);
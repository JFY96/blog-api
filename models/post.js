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

PostSchema.set('toObject', { virtuals: true });
PostSchema.set('toJSON', { virtuals: true });

PostSchema
	.virtual('unixTimestamp')
	.get(function() {
		return this.timestamp.getTime();
	});

module.exports = mongoose.model('Post', PostSchema);
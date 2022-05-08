const Comment = require('../models/comment');

class CommentService {

	getComments = (postId, orderBy = '') => {
		if (orderBy !== 'asc' && orderBy !== 'desc') orderBy = 'desc';
		return Comment.find({ post: postId })
			.sort([['timestamp', orderBy]])
			.exec();
	};

	getComment = (commentId) => {
		return Comment.findById(commentId);
	};

	createComment = (postId, user, name, content) => {
		const comment = new Comment({
			post: postId,
			user,
			name,
			content,
		});
		return comment.save();
	};

	updateComment = (commentId, content) => {
		return Comment.updateOne({ _id: commentId }, { content });
	};

	deleteComment = (commentId) => {
		return Comment.deleteOne({ _id: commentId });
	};
}

module.exports = CommentService;
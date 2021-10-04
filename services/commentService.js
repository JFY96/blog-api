const Comment = require('../models/comment');

class CommentService {

	getComments = (postId) => {
		return Comment.find({ post: postId })
			.sort([['timestamp', 'asc']])
			.exec();
	};

	getComment = (commentId) => {
		return Comment.findById(commentId);
	};

	createComment = (postId, user, content) => {
		const comment = new Comment({
			post: postId,
			user,
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
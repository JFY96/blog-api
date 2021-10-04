const Post = require('../models/post');
const Comment = require('../models/comment');

class PostService {

	getPosts = async () => {
		return Post.find()
			.sort([['timestamp', 'asc']])
			.exec();
	}

	getPost = async (postId) => {
		return Post.findById(postId);
	}

	deletePost = async (postId) => {
		return Promise.all([
			Post.findByIdAndRemove(postId),
			Comment.deleteMany({ post: postId }),
		]);
	};

	createPost = async (body, user) => {
		const post = new Post({
			title: body.title,
			content: body.content,
			user: user._id,
			private: false,
		});
		return post.save();
	};

	updatePost = async (postId, body) => {
		const updateArr = {};
		if (body.title) updateArr.title = body.title;
		if (body.content) updateArr.content = body.content;
		return Post.updateOne({ _id: postId }, updateArr);
	}
}

module.exports = PostService;
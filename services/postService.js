const Post = require('../models/post');
const Comment = require('../models/comment');

class PostService {

	getPosts = async (admin = false, includeCount = false, orderBy = '') => {
		if (orderBy !== 'asc' && orderBy !== 'desc') orderBy = 'desc';
		const params = {};
		if (!admin) {
			params.published = true;
		}
		const query = Post.find(params)
			.sort([['timestamp', orderBy]]);
		return includeCount ? query.populate('commentCount').exec() : query.exec();
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
			published: false,
		});
		return post.save();
	};

	updatePost = async (postId, body) => {
		const updateArr = {};
		if (body.title !== undefined) updateArr.title = body.title;
		if (body.content !== undefined) updateArr.content = body.content;
		if (body.published !== undefined) updateArr.published = body.published;
		return Post.updateOne({ _id: postId }, updateArr);
	}
}

module.exports = PostService;
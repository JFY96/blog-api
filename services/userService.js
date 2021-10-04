const User = require('../models/user');

class UserService {

	getUsers = () => {
		return User.find()
			.sort([['timestamp', 'asc']])
			.exec();
	}

	getUser = (userId) => {
		return User.findById(userId);
	}
}

module.exports = UserService;
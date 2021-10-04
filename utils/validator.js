const { validationResult } = require('express-validator');

// validation to only allow user who owns a resource, or an admin to modify
const checkReqUser = (req, res, next, user) => {
	if (!user || !req.user || (user.toString() !== req.user._id.toString() && !req.user.admin)) {
		return res.status(401).json({
			error: 'User not authorized',
		});
	}
	return next();
};

const validateErrorsWithCustomHTTPStatus = (httpStatus) => (req, res, next) => {
	const errors = validationResult(req);
	if (errors.isEmpty()) {
		return next();
	}

	const extractedErrors = errors.array().reduce((accum, err) => {
		accum[err.param] = err.msg;
		return accum;
	}, {});

	return res.status(httpStatus).json({
		errors: extractedErrors,
	});
};

const validateErrors = validateErrorsWithCustomHTTPStatus(422); // 422 UNPROCESSABLE ENTITY

module.exports = {
	checkReqUser,
	validateErrorsWithCustomHTTPStatus,
	validateErrors,
};
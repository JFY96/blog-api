const { validationResult } = require('express-validator');

// validation to only allow user who owns a resource, or an admin to modify
const checkReqUser = (req, res, next, user) => {
	if (!req.user.admin && (!user || !req.user || user.toString() !== req.user._id.toString())) {
		return res.status(401).json({
			success: false,
			error: 'User not authorized',
		});
	}
	return next();
};

const checkAdminUser = (req, res, next, adminRequired = true) => {
	if (adminRequired && !req.user.admin) return res.status(401).json({
		success: false,
		error: 'User not authorized',
	});
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
		success: false,
		errors: extractedErrors,
	});
};

const validateErrors = validateErrorsWithCustomHTTPStatus(422); // 422 UNPROCESSABLE ENTITY

module.exports = {
	checkReqUser,
	checkAdminUser,
	validateErrorsWithCustomHTTPStatus,
	validateErrors,
};
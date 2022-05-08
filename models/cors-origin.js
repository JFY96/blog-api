const mongoose = require('mongoose');

const CorsOriginSchema = new mongoose.Schema({
	uri: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model('CorsOrigin', CorsOriginSchema);
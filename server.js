const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const dotenv_result = require('dotenv').config();
if (dotenv_result.error && (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production')) throw dotenv_result.error;

const app = express();

// environment variables
const PORT = process.env.PORT || 80;

const DB_URI = process.env.MONGODB_URI || '';
if (!DB_URI) {
	console.error('No DB URI found. Cannot start app.');
	process.exit(1);
}

// passport js setup
require('./utils/passport');
const { authJWT, authJWTPublic } = require('./utils/auth');

// application middlewares
app.use(morgan('short'));
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

module.exports = async () => {
	// MongoDB (mongoose) connection
	try {
		await mongoose.connect(DB_URI, {
			useUnifiedTopology: true,
			useNewUrlParser: true 
		});
		console.log('Connected to MongoDB');
		mongoose.connection.on('error', console.error.bind(console, "MongoDB connection error"));

		// Allowed Cors URIs
		const CorsOrigin = require('./models/cors-origin');
		const origins = await CorsOrigin.find({}).then((corsOriginResult) => {
			return corsOriginResult.map(corsOrigin => corsOrigin.uri);
		});
		app.use(cors(
			{
				origin: origins,
				methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
				preflightContinue: false,
				optionsSuccessStatus: 204,
				credentials: true,
			}
		));
		
		// routes
		const authRouter = require('./routes/authRouter');
		const apiPublicRouter = require('./routes/apiPublicRouter');
		const apiRouter = require('./routes/apiRouter');
		app.use('/api/auth', authRouter);
		app.use('/api', authJWTPublic, apiPublicRouter);
		app.use('/api', authJWT, apiRouter);

	} catch (err) {
		console.log('Failed to connect to MongoDB');
		console.error(err);
	}
	// Start server
	app.listen(PORT, () => {
		console.log(`Server started on port ${PORT}`);
	});	
};
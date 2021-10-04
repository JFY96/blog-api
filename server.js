const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const dotenv_result = require('dotenv').config();
if (dotenv_result.error) throw dotenv_result.error;

const app = express();

// environment variables
const PORT = process.env.port || 3000;

const DB_URI = process.env.MONGODB_URI || '';
if (!DB_URI) {
	console.error('No DB URI found. Cannot start app.');
	process.exit(1);
}

// passport js setup
require('./utils/passport');
const { authJWT } = require('./utils/auth');

// application middlewares
app.use(passport.initialize());
app.use(express.json());

// routes
const authRouter = require('./routes/authRouter');
const apiRouter = require('./routes/apiRouter');
app.use('/api/auth', authRouter);
app.use('/api', authJWT, apiRouter);

module.exports = async () => {
	// MongoDB (mongoose) connection
	try {
		await mongoose.connect(DB_URI, {
			useUnifiedTopology: true,
			useNewUrlParser: true 
		});
		console.log('Connected to MongoDB');
		mongoose.connection.on('error', console.error.bind(console, "MongoDB connection error"));
	} catch {
		console.log('Failed to connect to MongoDB');
		console.error(err);
	}
	// Start server
	app.listen(PORT, () => {
		console.log(`Server started on port ${PORT}`);
	});	
};
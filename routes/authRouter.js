const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

// user auth related
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/refresh_token', userController.refreshToken);
router.post('/logout', userController.logout);

module.exports = router;
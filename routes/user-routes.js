const express = require('express');
const router = express.Router();

const userController = require('./../controllers/user-controller');
const authMiddleware = require('./../middleware/auth-middleware');

router.get('/register', userController.showRegister);
router.post('/register', userController.handleRegister);
router.get('/login', userController.showLogin);
router.post('/login', userController.handleLogin);
router.get('/profile', authMiddleware.isLoggedIn, userController.showProfile);
router.post('/profile', authMiddleware.isLoggedIn, userController.handleProfile);
router.get('/forgetPass', userController.showForget);
router.post('/forgetPass', userController.handlePass);
router.get('/deleteAccount', authMiddleware.isLoggedIn, userController.showDelete);
router.post('/deleteAccount', authMiddleware.isLoggedIn, userController.handleDelete);

module.exports = router;
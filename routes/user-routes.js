const express = require('express');
const router = express.Router();

const userController = require('./../controllers/user-controller');

router.get('/register', userController.showRegister);
router.post('/register', userController.handleRegister);
router.get('/login', userController.showLogin);
router.post('/login', userController.handleLogin);

module.exports = router;
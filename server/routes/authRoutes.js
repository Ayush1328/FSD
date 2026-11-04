const express = require('express');
const router = express.Router();
const { register, login, getMe, refreshToken, logout } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../validators/authValidator');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authMiddleware, getMe);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

module.exports = router;

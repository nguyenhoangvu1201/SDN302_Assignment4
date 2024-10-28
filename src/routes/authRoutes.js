const express = require('express');
const { register, login, getUserInfo, updateUserInfo, getInfo } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/info', getInfo);
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/users/me', verifyToken, getUserInfo);
router.put('/users/me', verifyToken, updateUserInfo);


module.exports = router;
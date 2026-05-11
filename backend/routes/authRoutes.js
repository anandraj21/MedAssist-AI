const express = require('express');
const router = express.Router();
const { register, login, getMe, getDoctors } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/doctors', protect, getDoctors);

module.exports = router;

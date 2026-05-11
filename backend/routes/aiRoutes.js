const express = require('express');
const router = express.Router();
const { symptomCheck, aiChat, summarizeConsultation } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/symptom-check', protect, symptomCheck);
router.post('/chat', protect, aiChat);
router.post('/summarize', protect, summarizeConsultation);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointment,
  savePrescription,
  getMyPrescriptions,
} = require('../controllers/appointmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', protect, authorizeRoles('patient'), bookAppointment);
router.get('/my', protect, authorizeRoles('patient'), getMyAppointments);
router.get('/doctor', protect, authorizeRoles('doctor'), getDoctorAppointments);
router.put('/:id', protect, updateAppointment);
router.post('/:id/prescription', protect, authorizeRoles('doctor'), savePrescription);
router.get('/prescriptions', protect, authorizeRoles('patient'), getMyPrescriptions);

module.exports = router;

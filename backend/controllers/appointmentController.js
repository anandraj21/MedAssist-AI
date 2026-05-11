const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

// @desc  Book appointment
// @route POST /api/appointments
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, symptoms, aiSuggestion, type } = req.body;
    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId, date, timeSlot,
      symptoms: symptoms || '',
      aiSuggestion: aiSuggestion || '',
      type: type || 'online',
    });
    const populated = await appointment.populate(['patientId', 'doctorId']);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get my appointments (patient)
// @route GET /api/appointments/my
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate('doctorId', 'name specialization consultationFee')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get doctor appointments
// @route GET /api/appointments/doctor
const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.user._id })
      .populate('patientId', 'name email age bloodGroup phone')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update appointment status
// @route PUT /api/appointments/:id
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    Object.assign(appointment, req.body);
    await appointment.save();
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Save prescription
// @route POST /api/appointments/:id/prescription
const savePrescription = async (req, res) => {
  try {
    const { doctorNotes, diagnosis, medicines, aiSummary, followUpDate } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const prescription = await Prescription.create({
      appointmentId: appointment._id,
      patientId: appointment.patientId,
      doctorId: req.user._id,
      doctorNotes, diagnosis, medicines, aiSummary, followUpDate,
    });

    appointment.status = 'completed';
    await appointment.save();

    res.status(201).json(prescription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get patient prescriptions
// @route GET /api/appointments/prescriptions
const getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.user._id })
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointment,
  savePrescription,
  getMyPrescriptions,
};

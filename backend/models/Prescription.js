const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorNotes: { type: String, default: '' },
  diagnosis: { type: String, default: '' },
  medicines: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
  }],
  aiSummary: { type: String, default: '' },
  followUpDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);

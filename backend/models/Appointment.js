const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  symptoms: { type: String, default: '' },
  aiSuggestion: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: { type: String, default: '' },
  type: { type: String, enum: ['online', 'in-person'], default: 'online' },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);

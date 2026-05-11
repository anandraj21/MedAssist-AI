const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  // Doctor-specific fields
  specialization: { type: String, default: '' },
  experience: { type: Number, default: 0 },
  consultationFee: { type: Number, default: 500 },
  availableDays: [{ type: String }],
  availableHours: { start: String, end: String },
  // Patient-specific fields
  age: { type: Number },
  bloodGroup: { type: String },
  phone: { type: String },
  address: { type: String },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

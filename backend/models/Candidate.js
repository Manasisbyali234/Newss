const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  phone: { type: String },
  course: { type: String }, // Course/Branch from Excel data
  credits: { type: Number, default: 0 },
  registrationMethod: { type: String, enum: ['signup', 'admin', 'placement', 'email_signup'], default: 'signup' },
  placementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Placement' },
  fileId: { type: mongoose.Schema.Types.ObjectId }, // Reference to specific file in placement's fileHistory
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  resetPasswordOTP: { type: String },
  resetPasswordOTPExpires: { type: Date }
}, {
  timestamps: true
});

candidateSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  // Don't hash passwords for placement candidates
  if (this.registrationMethod === 'placement') {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

candidateSchema.methods.comparePassword = async function(password) {
  // For placement candidates, compare plain text passwords
  if (this.registrationMethod === 'placement') {
    return password === this.password;
  }
  // For other candidates, use bcrypt
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Candidate', candidateSchema);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  phone: { type: String },
  companyName: { type: String, required: true },
  employerType: { type: String, enum: ['company', 'consultant'], default: 'company' },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  isApproved: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  resetPasswordOTP: { type: String },
  resetPasswordOTPExpires: { type: Date }
}, {
  timestamps: true
});

employerSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

employerSchema.methods.comparePassword = async function(password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

// Optimized indexes for employer queries
employerSchema.index({ status: 1, isApproved: 1, createdAt: -1 });
employerSchema.index({ email: 1 });
employerSchema.index({ companyName: 1 });
employerSchema.index({ employerType: 1 });
employerSchema.index({ companyName: 'text' });

module.exports = mongoose.model('Employer', employerSchema);
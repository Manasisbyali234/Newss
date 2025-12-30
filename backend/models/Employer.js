const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    set: function(email) {
      // Store email as-is to preserve original formatting
      return email;
    }
  },
  password: { type: String, required: false },
  phone: { type: String },
  companyName: { type: String, required: true },
  employerType: { type: String, enum: ['company', 'consultant'], default: 'company' },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  isApproved: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'approvedByModel' },
  approvedByModel: { type: String, enum: ['Admin', 'SubAdmin'] },
  profileSubmittedForReview: { type: Boolean, default: false },
  profileSubmittedAt: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  resetPasswordOTP: { type: String },
  resetPasswordOTPExpires: { type: Date }
}, {
  timestamps: true
});

// Email normalization for queries while preserving original email
employerSchema.index({ email: 1 }, { 
  collation: { locale: 'en', strength: 2 } // Case-insensitive index
});

// Static method for case-insensitive email lookup
employerSchema.statics.findByEmail = function(email) {
  return this.findOne({ 
    email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') 
  });
};

employerSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

employerSchema.methods.comparePassword = async function(password) {
  try {
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    return false;
  }
};

// Optimized indexes for employer queries
employerSchema.index({ status: 1, isApproved: 1, profileSubmittedForReview: 1, createdAt: -1 });
employerSchema.index({ email: 1 });
employerSchema.index({ companyName: 1 });
employerSchema.index({ employerType: 1 });
employerSchema.index({ companyName: 'text' });
employerSchema.index({ profileSubmittedAt: -1 });

module.exports = mongoose.model('Employer', employerSchema);
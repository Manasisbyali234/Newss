const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const placementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  phone: { type: String, required: true },
  collegeName: { type: String, required: true },
  logo: { type: String }, // Base64 encoded logo image
  idCard: { type: String }, // Base64 encoded ID card image
  studentData: { type: String }, // Base64 encoded Excel/CSV file
  fileName: { type: String },
  fileType: { type: String },
  credits: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' },

  isProcessed: { type: Boolean, default: false },
  processedAt: { type: Date },
  candidatesCreated: { type: Number, default: 0 },
  fileHistory: [{
    fileName: String,
    customName: String, // Custom display name set by user
    uploadedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'processed'], default: 'pending' },
    fileData: String, // Base64 encoded file data
    fileType: String, // MIME type
    processedAt: Date,
    candidatesCreated: { type: Number, default: 0 },
    credits: { type: Number, default: 0 },
    structuredData: [{
      rowIndex: Number,
      id: String,
      candidateName: String,
      collegeName: String,
      email: String,
      phone: String,
      course: String,
      password: String,
      creditsAssigned: Number,
      originalRowData: mongoose.Schema.Types.Mixed,
      processedAt: Date,
      placementId: mongoose.Schema.Types.ObjectId,
      fileId: mongoose.Schema.Types.ObjectId
    }],
    dataStoredAt: Date,
    recordCount: { type: Number, default: 0 }
  }],
  lastDashboardState: {
    data: mongoose.Schema.Types.Mixed,
    timestamp: Date
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  resetPasswordOTP: { type: String },
  resetPasswordOTPExpires: { type: Date }
}, {
  timestamps: true
});

placementSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

placementSchema.methods.comparePassword = async function(password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Placement', placementSchema);
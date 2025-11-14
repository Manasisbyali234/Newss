const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['profile_submitted', 'job_posted', 'application_received', 'application_status_updated', 'profile_approved', 'profile_rejected', 'interview_scheduled', 'interview_updated', 'profile_completion', 'file_uploaded', 'placement_processed', 'document_approved', 'document_rejected', 'support_response'], required: true },
  role: { type: String, enum: ['admin', 'candidate', 'employer'], required: true },
  isRead: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // Job ID or Profile ID
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' }, // For candidate-specific notifications
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
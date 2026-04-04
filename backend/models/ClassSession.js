const mongoose = require('mongoose');

const ClassSessionSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  class: { type: String, required: true },
  division: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  teacherIp: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, required: true }, // Sessions should expire after a few hours
}, { timestamps: true });

// Ensure only one active session per class/division/teacher
ClassSessionSchema.index({ class: 1, division: 1, isActive: 1 });

module.exports = mongoose.model('ClassSession', ClassSessionSchema);

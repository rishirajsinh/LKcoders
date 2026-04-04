// Collection: attendances
const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  class: { type: String, required: true },
  division: { type: String, required: true },
  status: { type: String, enum: ['present', 'absent', 'late'], required: true },
  method: { type: String, enum: ['face', 'self', 'manual'], default: 'manual' },
  ipMatch: { type: Boolean, default: false },
  faceConfidence: { type: Number, default: 0 },
  markedAt: { type: Date, default: Date.now },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Unique attendance per student per date
AttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ date: 1, class: 1, division: 1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);

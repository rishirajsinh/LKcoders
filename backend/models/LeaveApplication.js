// Collection: leaveapplications
const mongoose = require('mongoose');

const LeaveApplicationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  class: { type: String, required: true },
  division: { type: String, required: true },
  reason: { type: String, required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
}, { timestamps: true });

LeaveApplicationSchema.index({ studentId: 1, status: 1 });
LeaveApplicationSchema.index({ class: 1, division: 1, status: 1 });

module.exports = mongoose.model('LeaveApplication', LeaveApplicationSchema);

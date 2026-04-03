// Collection: subjectassignments
const mongoose = require('mongoose');

const SubjectAssignmentSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  class: { type: String, required: true },
  division: { type: String, required: true },
  subject: { type: String, required: true },
}, { timestamps: true });

// Prevent duplicate identical assignments
SubjectAssignmentSchema.index(
  { teacherId: 1, class: 1, division: 1, subject: 1 },
  { unique: true }
);

module.exports = mongoose.model('SubjectAssignment', SubjectAssignmentSchema);

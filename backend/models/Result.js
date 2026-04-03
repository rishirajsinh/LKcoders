// Collection: results
const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  marksObtained: { type: Number, required: true },
  totalMarks: { type: Number, required: true, default: 100 },
  grade: { type: String, required: true },
  examType: { type: String, enum: ['Midterm', 'Final', 'Unit Test'], required: true },
  date: { type: Date, required: true },
}, { timestamps: true });

ResultSchema.index({ studentId: 1 });

module.exports = mongoose.model('Result', ResultSchema);

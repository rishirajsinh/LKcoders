const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  class: { type: String, required: true },
  division: { type: String, required: true },
  subject: { type: String, required: true },
  title: { type: String, required: true },
  questions: [{
    id: { type: Number, required: true },
    text: { type: String, required: true },
    modelAnswer: { type: String, required: true },
    rubric: { type: String, required: true }, // Grading criteria
    maxScore: { type: Number, required: true }
  }],
  dueDate: { type: Date, required: true },
  gradingMode: { type: String, enum: ['auto', 'assisted'], default: 'auto' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Assessment', AssessmentSchema);

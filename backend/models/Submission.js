const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{
    questionId: { type: Number, required: true },
    answerText: { type: String },
    fileUrl: { type: String } // For handwritten work/images
  }],
  grades: [{
    questionId: { type: Number, required: true },
    score: { type: Number, default: 0 },
    feedback: { type: String },
    matchedKeywords: [{ type: String }],
    aiConfidence: { type: Number }
  }],
  totalScore: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'grading', 'graded', 'needs_review'], 
    default: 'pending' 
  },
  gradedBy: { type: String, enum: ['ai', 'teacher'], default: 'ai' },
  teacherFeedback: { type: String }
}, { timestamps: true });

// Index for quick lookup of student submissions for a specific assessment
SubmissionSchema.index({ assessmentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', SubmissionSchema);

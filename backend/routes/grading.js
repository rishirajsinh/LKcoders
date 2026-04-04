const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission');
const { gradeSubmission } = require('../utils/geminiUtils');
const { protect, checkRole } = require('../middleware/authMiddleware');
const PDFDocument = require('pdfkit');

/**
 * @route   POST /api/grading/assessment
 * @desc    Create a new assessment
 * @access  Private (Teacher)
 */
router.post('/assessment', protect, checkRole('teacher'), async (req, res) => {
  try {
    const { class: cls, division, subject, title, questions, dueDate, gradingMode } = req.body;
    const assessment = new Assessment({
      teacherId: req.user._id,
      class: cls,
      division,
      subject,
      title,
      questions,
      dueDate,
      gradingMode
    });
    await assessment.save();
    res.status(201).json({ success: true, data: assessment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * @route   POST /api/grading/submit
 * @desc    Submit student answers
 * @access  Private (Student)
 */
router.post('/submit', protect, checkRole('student'), async (req, res) => {
  try {
    const { assessmentId, answers } = req.body;
    const submission = new Submission({
      assessmentId,
      studentId: req.user._id,
      answers,
      status: 'pending'
    });
    await submission.save();
    res.status(201).json({ success: true, data: submission });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * @route   POST /api/grading/grade/:submissionId
 * @desc    Process grading via Gemini
 * @access  Private (Teacher)
 */
router.post('/grade/:submissionId', protect, checkRole('teacher'), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId).populate('assessmentId');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    submission.status = 'grading';
    await submission.save();

    // Call Gemini utility
    const aiResult = await gradeSubmission(submission.assessmentId, submission);

    // Update submission with AI results
    submission.grades = aiResult.grades;
    submission.totalScore = aiResult.totalScore;
    submission.overallFeedback = aiResult.overallFeedback;
    submission.status = submission.assessmentId.gradingMode === 'auto' ? 'graded' : 'needs_review';
    submission.gradedBy = 'ai';
    
    await submission.save();

    res.status(200).json({ success: true, data: submission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   GET /api/grading/assessment/:assessmentId/submissions
 * @desc    Get all submissions for an assessment
 * @access  Private (Teacher)
 */
router.get('/assessment/:assessmentId/submissions', protect, checkRole('teacher'), async (req, res) => {
  try {
    const submissions = await Submission.find({ assessmentId: req.params.assessmentId }).populate('studentId', 'name');
    res.status(200).json({ success: true, data: submissions });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * @route   GET /api/grading/assessment
 * @desc    Get assessments for a class/division
 * @access  Private (Teacher/Student)
 */
router.get('/assessment', protect, async (req, res) => {
  try {
    const { class: cls, division } = req.query;
    const filter = {};
    if (cls) filter.class = cls;
    if (division) filter.division = division;
    
    const assessments = await Assessment.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: assessments });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * @route   GET /api/grading/report/:submissionId
 * @desc    Generate PDF report for a submission
 * @access  Private (Teacher/Student)
 */
router.get('/report/:submissionId', protect, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
      .populate('assessmentId')
      .populate('studentId', 'name email');

    if (!submission || submission.status !== 'graded') {
      return res.status(404).json({ message: 'Graded submission not found' });
    }

    const doc = new PDFDocument();
    
    // HTTP headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Report_${submission.studentId.name.replace(/\s/g, '_')}.pdf`);

    doc.pipe(res);

    // PDF Content
    doc.fontSize(25).text('EduTrack Academic Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Student: ${submission.studentId.name}`);
    doc.text(`Subject: ${submission.assessmentId.subject}`);
    doc.text(`Assessment: ${submission.assessmentId.title}`);
    doc.text(`Date: ${new Date(submission.updatedAt).toLocaleDateString()}`);
    doc.moveDown();
    
    doc.fontSize(18).text(`Total Score: ${submission.totalScore} / ${submission.assessmentId.questions.reduce((acc, q) => acc + q.maxScore, 0)}`, { color: 'blue' });
    doc.moveDown();

    doc.fontSize(14).text('Detailed Feedback:', { underline: true });
    submission.grades.forEach((g, idx) => {
      doc.moveDown();
      doc.fontSize(12).text(`Question ${idx + 1}: ${g.score} Marks`);
      doc.fontSize(10).text(`Feedback: ${g.feedback}`, { oblique: true });
      if (g.matchedKeywords && g.matchedKeywords.length > 0) {
        doc.text(`Keywords: ${g.matchedKeywords.join(', ')}`);
      }
    });

    doc.moveDown();
    doc.fontSize(14).text('Overall Feedback:', { underline: true });
    doc.fontSize(11).text(submission.overallFeedback || 'No overall feedback provided.');

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

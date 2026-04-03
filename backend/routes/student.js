const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Timetable = require('../models/Timetable');
const Result = require('../models/Result');
const LeaveApplication = require('../models/LeaveApplication');

// Apply auth + student role guard to all routes
router.use(protect);
router.use(authorize('student'));

/* ─────────────────────────────────────────
   3A — ATTENDANCE
───────────────────────────────────────── */

// GET /api/student/attendance/:studentId
router.get('/attendance/:studentId', async (req, res) => {
  try {
    // A student may only view their own attendance
    if (req.user._id.toString() !== req.params.studentId) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only view your own attendance.' });
    }

    const records = await Attendance.find({ studentId: req.params.studentId })
      .sort({ date: -1 })
      .lean();

    const totalPresent = records.filter(r => r.status === 'present').length;
    const totalAbsent = records.filter(r => r.status === 'absent').length;
    const total = records.length;
    const percentage = total > 0 ? parseFloat(((totalPresent / total) * 100).toFixed(1)) : 0;

    res.json({ success: true, data: { records, totalPresent, totalAbsent, total, percentage } });
  } catch (err) {
    console.error('student/attendance GET error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

/* ─────────────────────────────────────────
   3B — TIMETABLE (read-only)
───────────────────────────────────────── */

// GET /api/student/timetable?class=X&division=Y
router.get('/timetable', async (req, res) => {
  try {
    const { class: cls, division } = req.query;
    if (!cls || !division) {
      return res.status(400).json({ success: false, message: 'class and division are required.' });
    }
    const slots = await Timetable.find({ class: cls, division })
      .populate('teacherId', 'name')
      .lean();
    res.json({ success: true, data: slots });
  } catch (err) {
    console.error('student/timetable GET error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

/* ─────────────────────────────────────────
   3C — RESULTS
───────────────────────────────────────── */

// GET /api/student/results/:studentId
router.get('/results/:studentId', async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.studentId) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only view your own results.' });
    }

    const results = await Result.find({ studentId: req.params.studentId })
      .sort({ date: -1 })
      .lean();

    let overallPct = 0;
    if (results.length > 0) {
      const totalObtained = results.reduce((s, r) => s + r.marksObtained, 0);
      const totalMax = results.reduce((s, r) => s + r.totalMarks, 0);
      overallPct = totalMax > 0 ? parseFloat(((totalObtained / totalMax) * 100).toFixed(1)) : 0;
    }

    res.json({ success: true, data: { results, overallPercentage: overallPct } });
  } catch (err) {
    console.error('student/results GET error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

/* ─────────────────────────────────────────
   3D — LEAVE APPLICATION
───────────────────────────────────────── */

// POST /api/student/leave
router.post('/leave', async (req, res) => {
  try {
    const { reason, fromDate, toDate } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Reason is required.' });
    }
    if (!fromDate || !toDate) {
      return res.status(400).json({ success: false, message: 'fromDate and toDate are required.' });
    }
    if (new Date(fromDate) > new Date(toDate)) {
      return res.status(400).json({ success: false, message: 'fromDate must be on or before toDate.' });
    }

    // Always read class/division from authenticated user — never from request body
    const studentDoc = await User.findById(req.user._id).select('class division').lean();
    if (!studentDoc) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const leave = await LeaveApplication.create({
      studentId: req.user._id,
      class: studentDoc.class,
      division: studentDoc.division,
      reason: reason.trim(),
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      status: 'pending',
      submittedAt: new Date(),
    });

    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    console.error('student/leave POST error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// GET /api/student/leaves/:studentId
router.get('/leaves/:studentId', async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.studentId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const leaves = await LeaveApplication.find({ studentId: req.params.studentId })
      .sort({ submittedAt: -1 })
      .lean();

    res.json({ success: true, data: leaves });
  } catch (err) {
    console.error('student/leaves GET error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// POST /api/student/bulk-import
router.post('/bulk-import', async (req, res) => {
  try {
    const { modelName, data } = req.body;
    
    if (!modelName || !data || !Array.isArray(data)) {
      return res.status(400).json({ success: false, message: 'modelName and an array of data are required.' });
    }

    let result;
    if (modelName.toLowerCase() === 'result') {
      result = await Result.insertMany(data, { ordered: false });
    } else if (modelName.toLowerCase() === 'attendance') {
      result = await Attendance.insertMany(data, { ordered: false });
    } else {
       return res.status(400).json({ success: false, message: 'Invalid modelName for student import. Allowed: result, attendance.' });
    }

    res.status(201).json({ success: true, message: `Successfully imported ${result.length} records into ${modelName}.` });
  } catch (err) {
    console.error('student bulk-import error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error during import.' });
  }
});

module.exports = router;

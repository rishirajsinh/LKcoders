const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const ClassSession = require('../models/ClassSession');
const Student = require('../models/Student');
const User = require('../models/User'); // For Teacher auth
const { isSameSubnet } = require('../utils/ipUtils');
const { protect, checkRole } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/attendance/session/start
 * @desc    Teacher starts an attendance session for a class
 * @access  Private (Teacher)
 */
router.post('/session/start', protect, checkRole('teacher'), async (req, res) => {
  try {
    const { class: cls, division } = req.body;
    const teacherIp = req.socket.remoteAddress || req.headers['x-forwarded-for'];

    // Close any previous active sessions for this class/div
    await ClassSession.updateMany(
      { class: cls, division, isActive: true },
      { isActive: false }
    );

    const session = await ClassSession.create({
      teacherId: req.user._id,
      class: cls,
      division,
      teacherIp,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    });

    res.status(201).json({ success: true, message: 'Attendance session started', data: session });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * @route   GET /api/attendance/session/check
 * @desc    Check if a session is active for a class/division
 * @access  Private (Student/Teacher)
 */
router.get('/session/check', protect, async (req, res) => {
  try {
    const { class: cls, division } = req.query;
    const session = await ClassSession.findOne({ class: cls, division, isActive: true });
    res.status(200).json({ success: true, data: session });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * @route   POST /api/attendance/mark
 * @desc    Student marks their attendance (Face or Self-mark)
 * @access  Private (Student)
 */
router.post('/mark', protect, checkRole('student'), async (req, res) => {
  try {
    const { method, faceConfidence, class: cls, division } = req.body;
    const studentIp = req.socket.remoteAddress || req.headers['x-forwarded-for'];

    // 1. Find active session for this class
    const session = await ClassSession.findOne({ class: cls, division, isActive: true });
    if (!session) {
      return res.status(404).json({ success: false, message: 'No active attendance session found for your class.' });
    }

    // 2. Security Check: IP Subnet Match
    const ipMatch = isSameSubnet(studentIp, session.teacherIp);
    if (method === 'self' && !ipMatch) {
      return res.status(403).json({ success: false, message: 'IP mismatch. You must be on the same network as your teacher.' });
    }

    // 3. Face Confidence Check (if method is face)
    if (method === 'face' && faceConfidence < 0.6) {
      return res.status(403).json({ success: false, message: 'Face verification failed. Confidence too low.' });
    }

    // 4. Save Attendance
    const date = new Date().toISOString().slice(0, 10);
    const attendance = await Attendance.findOneAndUpdate(
      { studentId: req.user._id, date },
      {
        studentId: req.user._id,
        date,
        class: cls,
        division,
        status: 'present',
        method,
        ipMatch,
        faceConfidence: faceConfidence || 0,
        markedAt: new Date(),
        markedBy: req.user._id // Marked by the student themselves
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, message: 'Attendance marked successfully', data: attendance });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * @route   POST /api/attendance/session/stop
 * @desc    Teacher stops their active session
 * @access  Private (Teacher)
 */
router.post('/session/stop', protect, checkRole('teacher'), async (req, res) => {
  try {
    const { class: cls, division } = req.body;
    await ClassSession.updateMany(
      { teacherId: req.user._id, class: cls, division, isActive: true },
      { isActive: false }
    );
    res.status(200).json({ success: true, message: 'Attendance session stopped' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;

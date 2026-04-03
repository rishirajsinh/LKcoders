const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Timetable = require('../models/Timetable');
const LeaveApplication = require('../models/LeaveApplication');

// Apply auth + teacher role guard to all routes
router.use(protect);
router.use(authorize('teacher'));

/* ─────────────────────────────────────────
   2A — MARK ATTENDANCE
───────────────────────────────────────── */

// GET /api/teacher/students?class=X&division=Y
router.get('/students', async (req, res) => {
  try {
    const { class: cls, division } = req.query;
    if (!cls || !division) {
      return res.status(400).json({ success: false, message: 'class and division are required.' });
    }
    const students = await User.find({ role: 'student', class: cls, division })
      .select('_id name')
      .lean();
    res.json({ success: true, data: students });
  } catch (err) {
    console.error('teacher/students error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// POST /api/teacher/attendance
// Body: { date, class, division, records: [{ studentId, status }] }
router.post('/attendance', async (req, res) => {
  try {
    const { date, class: cls, division, records } = req.body;
    if (!date || !cls || !division || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'date, class, division, and records are required.' });
    }

    const teacherId = req.user._id;

    const ops = records.map(r => ({
      updateOne: {
        filter: { studentId: r.studentId, date, class: cls, division },
        update: {
          $set: {
            studentId: r.studentId,
            date,
            class: cls,
            division,
            status: r.status,
            markedBy: teacherId,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(ops);
    res.json({ success: true, message: 'Attendance saved successfully.' });
  } catch (err) {
    console.error('teacher/attendance POST error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// GET /api/teacher/attendance?date=YYYY-MM-DD&class=X&division=Y
router.get('/attendance', async (req, res) => {
  try {
    const { date, class: cls, division } = req.query;
    if (!date || !cls || !division) {
      return res.status(400).json({ success: false, message: 'date, class, and division are required.' });
    }
    const records = await Attendance.find({ date, class: cls, division })
      .populate('studentId', 'name')
      .lean();
    res.json({ success: true, data: records });
  } catch (err) {
    console.error('teacher/attendance GET error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

/* ─────────────────────────────────────────
   2B — CLASS OVERVIEW
───────────────────────────────────────── */

// GET /api/teacher/class-overview?class=X&division=Y
router.get('/class-overview', async (req, res) => {
  try {
    const { class: cls, division } = req.query;
    if (!cls || !division) {
      return res.status(400).json({ success: false, message: 'class and division are required.' });
    }

    const students = await User.find({ role: 'student', class: cls, division }).select('_id name').lean();
    const totalStudents = students.length;

    if (totalStudents === 0) {
      return res.json({ success: true, data: { totalStudents: 0, averageAttendance: 0, students: [] } });
    }

    const studentIds = students.map(s => s._id);

    // Aggregate attendance per student
    const attRecords = await Attendance.find({ studentId: { $in: studentIds } }).lean();

    // Group by studentId
    const map = {};
    for (const r of attRecords) {
      const id = r.studentId.toString();
      if (!map[id]) map[id] = { present: 0, absent: 0 };
      if (r.status === 'present') map[id].present++;
      else map[id].absent++;
    }

    const studentStats = students.map(s => {
      const id = s._id.toString();
      const stats = map[id] || { present: 0, absent: 0 };
      const total = stats.present + stats.absent;
      const pct = total > 0 ? parseFloat(((stats.present / total) * 100).toFixed(1)) : 0;
      return { _id: s._id, name: s.name, present: stats.present, absent: stats.absent, percentage: pct };
    });

    const avgAtt = studentStats.length > 0
      ? parseFloat((studentStats.reduce((a, s) => a + s.percentage, 0) / studentStats.length).toFixed(1))
      : 0;

    res.json({ success: true, data: { totalStudents, averageAttendance: avgAtt, students: studentStats } });
  } catch (err) {
    console.error('class-overview error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

/* ─────────────────────────────────────────
   2C — TIMETABLE (read-only for teacher)
───────────────────────────────────────── */

// GET /api/teacher/timetable?class=X&division=Y
router.get('/timetable', async (req, res) => {
  try {
    const { class: cls, division } = req.query;
    if (!cls || !division) {
      return res.status(400).json({ success: false, message: 'class and division are required.' });
    }
    const slots = await Timetable.find({ class: cls, division })
      .populate('teacherId', 'name email')
      .lean();
    res.json({ success: true, data: slots });
  } catch (err) {
    console.error('teacher/timetable error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

/* ─────────────────────────────────────────
   2D — LEAVE APPLICATIONS
───────────────────────────────────────── */

// GET /api/teacher/leaves?class=X&division=Y&status=pending
router.get('/leaves', async (req, res) => {
  try {
    const { class: cls, division, status } = req.query;
    if (!cls || !division) {
      return res.status(400).json({ success: false, message: 'class and division are required.' });
    }
    const filter = { class: cls, division };
    if (status) filter.status = status;

    const leaves = await LeaveApplication.find(filter)
      .populate('studentId', 'name email')
      .sort({ submittedAt: -1 })
      .lean();
    res.json({ success: true, data: leaves });
  } catch (err) {
    console.error('teacher/leaves GET error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// PATCH /api/teacher/leaves/:leaveId
router.patch('/leaves/:leaveId', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'status must be approved or rejected.' });
    }

    const updated = await LeaveApplication.findByIdAndUpdate(
      req.params.leaveId,
      { $set: { status, reviewedBy: req.user._id, reviewedAt: new Date() } },
      { new: true, runValidators: true }
    ).populate('studentId', 'name');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Leave application not found.' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('teacher/leaves PATCH error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// POST /api/teacher/config
router.post('/config', async (req, res) => {
  try {
    const { assignedClass, assignedDivision } = req.body;
    if (!assignedClass || !assignedDivision) {
       return res.status(400).json({ success: false, message: 'class and division are required.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { assignedClass, assignedDivision } },
      { new: true }
    );
    res.json({ success: true, data: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

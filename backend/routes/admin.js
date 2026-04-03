const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const SubjectAssignment = require('../models/SubjectAssignment');
const Timetable = require('../models/Timetable');
const AcademicCalendar = require('../models/AcademicCalendar');

// Apply auth + admin role guard to all routes
router.use(protect);
router.use(authorize('admin'));

/* ─────────────────────────────────────────
   1E — STUDENT MANAGEMENT
───────────────────────────────────────── */

// POST /api/admin/add-student
router.post('/add-student', async (req, res) => {
  try {
    const { name, email, password, class: cls, division } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(409).json({ success: false, message: 'A user with that email already exists.' });
    }

    const student = await User.create({
      name,
      email,
      password: password,
      role: 'student',
      class: cls || '',
      division: division || '',
    });

    res.status(201).json({
      success: true,
      data: { _id: student._id, name: student.name, email: student.email, class: student.class, division: student.division },
    });
  } catch (err) {
    console.error('add-student error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// GET /api/admin/students
router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .lean();
    res.json({ success: true, data: students });
  } catch (err) {
    console.error('get-students error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// POST /api/admin/add-teacher
router.post('/add-teacher', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res.status(409).json({ success: false, message: 'A user with that email already exists.' });
    }

    const teacher = await User.create({
      name,
      email,
      password: password,
      role: 'teacher',
    });

    res.status(201).json({
      success: true,
      data: { _id: teacher._id, name: teacher.name, email: teacher.email, role: teacher.role },
    });
  } catch (err) {
    console.error('add-teacher error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

/* ─────────────────────────────────────────
   1A — SUBJECT ASSIGNMENT
───────────────────────────────────────── */

// POST /api/admin/assign-subject
router.post('/assign-subject', async (req, res) => {
  try {
    const { teacherId, class: cls, division, subject } = req.body;
    if (!teacherId || !cls || !division || !subject) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const assignment = await SubjectAssignment.findOneAndUpdate(
      { teacherId, class: cls, division, subject },
      { $set: { teacherId, class: cls, division, subject } },
      { upsert: true, new: true, runValidators: true }
    );

    // Sync to teacher's profile so their dashboard loads it automatically
    await User.findByIdAndUpdate(teacherId, {
      $set: { assignedClass: cls, assignedDivision: division }
    });

    res.status(200).json({ success: true, data: assignment });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'This exact assignment already exists.' });
    }
    console.error('assign-subject error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// GET /api/admin/assignments
router.get('/assignments', async (req, res) => {
  try {
    const assignments = await SubjectAssignment.find()
      .populate('teacherId', 'name email')
      .lean();
    res.json({ success: true, data: assignments });
  } catch (err) {
    console.error('get-assignments error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// DELETE /api/admin/remove-subject/:assignmentId
router.delete('/remove-subject/:assignmentId', async (req, res) => {
  try {
    const deleted = await SubjectAssignment.findByIdAndDelete(req.params.assignmentId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }
    res.json({ success: true, message: 'Assignment removed.' });
  } catch (err) {
    console.error('remove-subject error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

/* ─────────────────────────────────────────
   1B — ATTENDANCE OVERVIEW
───────────────────────────────────────── */

// GET /api/admin/attendance/summary?date=YYYY-MM-DD&class=X&division=Y
router.get('/attendance/summary', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { date = today, class: cls, division } = req.query;

    const filter = { date };
    if (cls) filter.class = cls;
    if (division) filter.division = division;

    const records = await Attendance.find(filter)
      .populate('studentId', 'name')
      .lean();

    let present = 0;
    let absent = 0;
    const recordList = records.map(r => {
      if (r.status === 'present') present++;
      else absent++;
      return {
        studentId: r.studentId?._id,
        studentName: r.studentId?.name || 'Unknown',
        status: r.status,
      };
    });

    res.json({ success: true, data: { present, absent, date, records: recordList } });
  } catch (err) {
    console.error('attendance/summary error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

/* ─────────────────────────────────────────
   1C — TIMETABLE
───────────────────────────────────────── */

// GET /api/admin/timetable?class=X&division=Y
router.get('/timetable', async (req, res) => {
  try {
    const { class: cls, division } = req.query;
    if (!cls || !division) {
      return res.status(400).json({ success: false, message: 'class and division query params are required.' });
    }
    const slots = await Timetable.find({ class: cls, division })
      .populate('teacherId', 'name email')
      .lean();
    res.json({ success: true, data: slots });
  } catch (err) {
    console.error('get-timetable error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// POST /api/admin/timetable
router.post('/timetable', async (req, res) => {
  try {
    const { class: cls, division, day, period, subject, teacherId } = req.body;
    if (!cls || !division || !day || !period || !subject || !teacherId) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const slot = await Timetable.findOneAndUpdate(
      { class: cls, division, day, period },
      { $set: { subject, teacherId, class: cls, division, day, period } },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: slot });
  } catch (err) {
    console.error('create-timetable error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// PUT /api/admin/timetable/:timetableId
router.put('/timetable/:timetableId', async (req, res) => {
  try {
    const { subject, teacherId } = req.body;
    if (!subject || !teacherId) {
      return res.status(400).json({ success: false, message: 'subject and teacherId are required.' });
    }
    const updated = await Timetable.findByIdAndUpdate(
      req.params.timetableId,
      { $set: { subject, teacherId } },
      { new: true, runValidators: true }
    ).populate('teacherId', 'name email');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Timetable slot not found.' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('update-timetable error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

/* ─────────────────────────────────────────
   1D — ACADEMIC CALENDAR
───────────────────────────────────────── */

// GET /api/admin/calendar?month=MM&year=YYYY
router.get('/calendar', async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month || now.getMonth() + 1, 10);
    const year = parseInt(req.query.year || now.getFullYear(), 10);

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const events = await AcademicCalendar.find({
      date: { $gte: start, $lt: end },
    }).lean();

    res.json({ success: true, data: events });
  } catch (err) {
    console.error('get-calendar error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// POST /api/admin/calendar
router.post('/calendar', async (req, res) => {
  try {
    const { title, date, type, description } = req.body;
    if (!title || !date || !type) {
      return res.status(400).json({ success: false, message: 'title, date, and type are required.' });
    }
    const event = await AcademicCalendar.create({ title, date, type, description: description || '' });
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    console.error('create-calendar error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// DELETE /api/admin/calendar/:eventId
router.delete('/calendar/:eventId', async (req, res) => {
  try {
    const deleted = await AcademicCalendar.findByIdAndDelete(req.params.eventId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    res.json({ success: true, message: 'Event deleted.' });
  } catch (err) {
    console.error('delete-calendar error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// GET /api/admin/teachers (helper for dropdowns)
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password').lean();
    res.json({ success: true, data: teachers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// POST /api/admin/bulk-import
router.post('/bulk-import', async (req, res) => {
  try {
    const { modelName, data } = req.body;
    
    if (!modelName || !data || !Array.isArray(data)) {
      return res.status(400).json({ success: false, message: 'modelName and an array of data are required.' });
    }

    let result;
    if (modelName.toLowerCase() === 'user' || modelName.toLowerCase() === 'student') {
      result = await User.insertMany(data, { ordered: false });
    } else if (modelName.toLowerCase() === 'attendance') {
      result = await Attendance.insertMany(data, { ordered: false });
    } else if (modelName.toLowerCase() === 'timetable') {
      result = await Timetable.insertMany(data, { ordered: false });
    } else {
       return res.status(400).json({ success: false, message: 'Invalid modelName for import.' });
    }

    res.status(201).json({ success: true, message: `Successfully imported ${result.length} records into ${modelName}.` });
  } catch (err) {
    console.error('bulk-import error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error during import.' });
  }
});

module.exports = router;

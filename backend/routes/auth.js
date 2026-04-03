const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, institution, department } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = new User({
      name, email, password, role, institution, department
    });
    
    await user.save();

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      class: user.class || '',
      division: user.division || '',
      assignedClass: user.assignedClass || '',
      assignedDivision: user.assignedDivision || '',
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error('REGISTRATION ERROR:', err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        class: user.class || '',
        division: user.division || '',
        assignedClass: user.assignedClass || '',
        assignedDivision: user.assignedDivision || '',
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
});

// @route   POST /api/auth/seed
// @desc    Seed the database with initial users and students for testing
router.post('/seed', async (req, res, next) => {
  try {
    // Create default teacher
    const teacherExists = await User.findOne({ email: 'teacher@eduflow.ai' });
    if (!teacherExists) {
        await User.create({
            name: 'Dr. Anita Sharma',
            email: 'teacher@eduflow.ai',
            password: 'password123',
            role: 'teacher'
        });
    }

    // Create default admin
    const adminExists = await User.findOne({ email: 'admin@school.edu' });
    if (!adminExists) {
        await User.create({
            name: 'Prof. Suresh Kumar',
            email: 'admin@school.edu',
            password: 'password123',
            role: 'admin'
        });
    }

    // Create some students if they don't exist
    const studentsExist = await Student.countDocuments();
    if (studentsExist === 0) {
        await Student.create([
            { name: 'Aarav Mehta', rollNo: 'STU001', class: '10A', email: 'aarav@eduflow.ai', avatar: 'AM' },
            { name: 'Ishita Roy', rollNo: 'STU002', class: '10A', email: 'ishita@eduflow.ai', avatar: 'IR' },
            { name: 'Rohan Singh', rollNo: 'STU003', class: '10B', email: 'rohan@eduflow.ai', avatar: 'RS' }
        ]);
    }

    res.json({ message: 'Database seeded successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

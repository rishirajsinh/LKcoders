// Database Utility Scripts Archive
// Contains logic previously scattered across test/fix scripts.

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

async function resetAllStudentPasswords() {
  await mongoose.connect(process.env.MONGO_URI);
  const students = await User.find({ role: 'student' });
  for (let s of students) { s.password = '123456'; await s.save(); }
  console.log('Reset students.');
}

async function resetAllTeacherPasswords() {
  await mongoose.connect(process.env.MONGO_URI);
  const teachers = await User.find({ role: 'teacher' });
  for (let t of teachers) { t.password = 'password123'; await t.save(); }
  console.log('Reset teachers.');
}

// To run: Uncomment the desired function above and call it here, then run using Node.

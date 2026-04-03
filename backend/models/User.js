const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'student', 'admin'], default: 'student' },
  institution: { type: String },
  department: { type: String },
  // For students: which class and division they belong to
  class: { type: String, default: '' },
  division: { type: String, default: '' },
  // For teachers: which class and division they are assigned to manage
  assignedClass: { type: String, default: '' },
  assignedDivision: { type: String, default: '' },
  // Link to Student document if role === 'student'
  studentProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }
}, { timestamps: true });

UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

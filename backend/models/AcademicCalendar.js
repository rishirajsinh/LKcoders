// Collection: academiccalendars
const mongoose = require('mongoose');

const AcademicCalendarSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['Holiday', 'Exam', 'Event'], required: true },
  description: { type: String, default: '' },
}, { timestamps: true });

AcademicCalendarSchema.index({ date: 1 });

module.exports = mongoose.model('AcademicCalendar', AcademicCalendarSchema);

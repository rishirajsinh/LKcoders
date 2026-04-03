// Collection: timetables
const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
  class: { type: String, required: true },
  division: { type: String, required: true },
  day: { type: String, required: true }, // Monday, Tuesday, etc.
  period: { type: Number, required: true, min: 1, max: 8 },
  subject: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// One slot per class+division+day+period combination
TimetableSchema.index(
  { class: 1, division: 1, day: 1, period: 1 },
  { unique: true }
);

module.exports = mongoose.model('Timetable', TimetableSchema);

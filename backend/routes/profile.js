const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// All profile routes require authentication (any role)
router.use(protect);

// GET /api/profile/me
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    console.error('profile/me error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// PATCH /api/profile/change-password
router.patch('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All three password fields are required.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirm password do not match.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    // Fetch full user (including password hash) for verification
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(
      req.user._id,
      { $set: { password: hashed } },
      { new: true }
    );

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('profile/change-password error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

module.exports = router;

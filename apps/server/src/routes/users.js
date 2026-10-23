const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// List users (admin+)
router.get('/', authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const { role, lga, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (lga) filter.lga = lga;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update own profile
router.patch('/me', async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'lga', 'crops', 'irrigationStatus', 'organization', 'avatar'];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin update user (role, active status)
router.patch('/:id', authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const { role, isActive, name, phone, lga } = req.body;
    const updates = {};
    if (role) updates.role = role;
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (lga) updates.lga = lga;

    // Super admin only can create other super_admins
    if (role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Only super admin can assign super_admin role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

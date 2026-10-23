const express = require('express');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const StorageFacility = require('../models/StorageFacility');
const Booking = require('../models/Booking');
const Produce = require('../models/Produce');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'super_admin', 'extension_officer'));

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalFarmers,
      totalOfficers,
      totalCampaigns,
      messagesSent,
      totalFacilities,
      activeBookings,
      availableProduce,
      farmersByLga,
      farmersByIrrigation,
    ] = await Promise.all([
      User.countDocuments({ role: 'farmer', isActive: true }),
      User.countDocuments({ role: 'extension_officer', isActive: true }),
      Campaign.countDocuments(),
      Campaign.aggregate([{ $group: { _id: null, total: { $sum: '$delivered' } } }]),
      StorageFacility.countDocuments({ isActive: true }),
      Booking.countDocuments({ status: { $in: ['pending', 'confirmed', 'active'] } }),
      Produce.countDocuments({ status: 'available' }),
      User.aggregate([
        { $match: { role: 'farmer', isActive: true } },
        { $group: { _id: '$lga', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      User.aggregate([
        { $match: { role: 'farmer', isActive: true } },
        { $group: { _id: '$irrigationStatus', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalFarmers,
          totalOfficers,
          totalCampaigns,
          messagesSent: messagesSent[0]?.total || 0,
          totalFacilities,
          activeBookings,
          availableProduce,
        },
        farmersByLga,
        farmersByIrrigation,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

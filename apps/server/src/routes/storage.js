const express = require('express');
const StorageFacility = require('../models/StorageFacility');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public list of active facilities
router.get('/facilities', async (req, res) => {
  try {
    const { lga, type } = req.query;
    const filter = { isActive: true };
    if (lga) filter.lga = lga;
    if (type) filter.type = type;

    const facilities = await StorageFacility.find(filter)
      .populate('operator', 'name organization phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: facilities.length, data: facilities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single facility
router.get('/facilities/:id', async (req, res) => {
  try {
    const facility = await StorageFacility.findById(req.params.id).populate(
      'operator',
      'name organization phone'
    );
    if (!facility) return res.status(404).json({ success: false, message: 'Facility not found' });
    res.json({ success: true, data: facility });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create facility (operator / admin)
router.post(
  '/facilities',
  protect,
  authorize('storage_operator', 'admin', 'super_admin'),
  async (req, res) => {
    try {
      const facility = await StorageFacility.create({
        ...req.body,
        operator: req.user._id,
        availableCapacityKg: req.body.totalCapacityKg,
      });
      res.status(201).json({ success: true, data: facility });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Book storage
router.post('/bookings', protect, authorize('farmer', 'admin', 'super_admin'), async (req, res) => {
  try {
    const { facilityId, quantityKg, startDate, endDate, cropType, notes } = req.body;

    const facility = await StorageFacility.findById(facilityId);
    if (!facility || !facility.isActive) {
      return res.status(404).json({ success: false, message: 'Facility not available' });
    }

    if (quantityKg > facility.availableCapacityKg) {
      return res.status(400).json({
        success: false,
        message: `Only ${facility.availableCapacityKg} kg available`,
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
    const totalCost = quantityKg * facility.pricePerKgPerDay * totalDays;

    const booking = await Booking.create({
      facility: facilityId,
      farmer: req.user._id,
      quantityKg,
      startDate: start,
      endDate: end,
      totalDays,
      totalCost,
      cropType,
      notes,
      status: 'pending',
    });

    // Reserve capacity
    facility.availableCapacityKg -= quantityKg;
    await facility.save();

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// My bookings (farmer)
router.get('/bookings/me', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ farmer: req.user._id })
      .populate('facility', 'name type lga address')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Operator view of bookings for their facilities
router.get(
  '/bookings/operator',
  protect,
  authorize('storage_operator', 'admin', 'super_admin'),
  async (req, res) => {
    try {
      const facilities = await StorageFacility.find({ operator: req.user._id }).select('_id');
      const ids = facilities.map((f) => f._id);
      const bookings = await Booking.find({ facility: { $in: ids } })
        .populate('farmer', 'name phone lga')
        .populate('facility', 'name type')
        .sort({ createdAt: -1 });
      res.json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;

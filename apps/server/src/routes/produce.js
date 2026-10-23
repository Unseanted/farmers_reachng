const express = require('express');
const Produce = require('../models/Produce');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public / authenticated list of available produce
router.get('/', async (req, res) => {
  try {
    const { crop, lga } = req.query;
    const filter = { status: 'available' };
    if (crop) filter.crop = crop;
    if (lga) filter.lga = lga;

    const listings = await Produce.find(filter)
      .populate('farmer', 'name phone lga')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: listings.length, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create listing (farmer)
router.post('/', protect, authorize('farmer', 'admin', 'super_admin'), async (req, res) => {
  try {
    const listing = await Produce.create({
      ...req.body,
      farmer: req.user._id,
      contactPhone: req.body.contactPhone || req.user.phone,
      lga: req.body.lga || req.user.lga,
    });
    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// My listings
router.get('/me', protect, async (req, res) => {
  try {
    const listings = await Produce.find({ farmer: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: listings.length, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update status
router.patch('/:id', protect, async (req, res) => {
  try {
    const listing = await Produce.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    // Owner or admin
    if (listing.farmer.toString() !== req.user._id.toString() && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    Object.assign(listing, req.body);
    await listing.save();
    res.json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

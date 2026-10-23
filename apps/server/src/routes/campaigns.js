const express = require('express');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { sendBulk } = require('../services/twilioService');

const router = express.Router();

// All routes require auth
router.use(protect);

// @route   GET /api/campaigns
router.get('/', authorize('extension_officer', 'admin', 'super_admin'), async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'extension_officer') {
      filter.createdBy = req.user._id;
    }
    const campaigns = await Campaign.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: campaigns.length, data: campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/campaigns
router.post('/', authorize('extension_officer', 'admin', 'super_admin'), async (req, res) => {
  try {
    const campaign = await Campaign.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/campaigns/:id/send
router.post('/:id/send', authorize('extension_officer', 'admin', 'super_admin'), async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Build farmer query based on targeting
    const query = { role: 'farmer', isActive: true, phone: { $exists: true, $ne: '' } };
    if (campaign.targetLgas?.length) query.lga = { $in: campaign.targetLgas };
    if (campaign.targetCrops?.length) query.crops = { $in: campaign.targetCrops };
    if (campaign.targetIrrigation && campaign.targetIrrigation !== 'all') {
      query.irrigationStatus = campaign.targetIrrigation;
    }

    const farmers = await User.find(query).select('phone name');
    const phones = farmers.map((f) => f.phone).filter(Boolean);

    if (phones.length === 0) {
      return res.status(400).json({ success: false, message: 'No matching farmers with phone numbers' });
    }

    campaign.status = 'sending';
    campaign.totalRecipients = phones.length;
    await campaign.save();

    // Send in background-ish (for demo we await)
    const results = await sendBulk(phones, campaign.message, campaign.channel);

    const delivered = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    campaign.status = 'completed';
    campaign.sentAt = new Date();
    campaign.delivered = delivered;
    campaign.failed = failed;
    campaign.deliveryLog = results.map((r) => ({
      phone: r.phone,
      status: r.success ? 'sent' : 'failed',
      sid: r.sid,
      error: r.error,
    }));
    await campaign.save();

    res.json({
      success: true,
      message: `Campaign sent to ${delivered} farmers (${failed} failed)`,
      data: campaign,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/campaigns/:id
router.get('/:id', authorize('extension_officer', 'admin', 'super_admin'), async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('createdBy', 'name email');
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    res.json({ success: true, data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

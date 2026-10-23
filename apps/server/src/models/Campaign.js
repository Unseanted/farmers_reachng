const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    channel: {
      type: String,
      enum: ['sms', 'whatsapp', 'both'],
      default: 'sms',
    },
    // Targeting
    targetLgas: [{ type: String }],
    targetCrops: [{ type: String }],
    targetIrrigation: {
      type: String,
      enum: ['all', 'none', 'partial', 'full'],
      default: 'all',
    },
    // Status
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sending', 'completed', 'failed'],
      default: 'draft',
    },
    scheduledAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    // Stats
    totalRecipients: {
      type: Number,
      default: 0,
    },
    delivered: {
      type: Number,
      default: 0,
    },
    failed: {
      type: Number,
      default: 0,
    },
    // Creator
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Delivery log (lightweight)
    deliveryLog: [
      {
        phone: String,
        status: { type: String, enum: ['queued', 'sent', 'delivered', 'failed'] },
        sid: String,
        error: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Campaign', campaignSchema);

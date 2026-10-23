const mongoose = require('mongoose');

const produceSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    crop: {
      type: String,
      required: true,
    },
    quantityKg: {
      type: Number,
      required: true,
    },
    unitPrice: {
      type: Number, // NGN per kg
    },
    quality: {
      type: String,
      enum: ['standard', 'premium', 'organic'],
      default: 'standard',
    },
    harvestDate: {
      type: Date,
    },
    availableFrom: {
      type: Date,
      default: Date.now,
    },
    lga: {
      type: String,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold', 'expired'],
      default: 'available',
    },
    contactPhone: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Produce', produceSchema);

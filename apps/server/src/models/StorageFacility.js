const mongoose = require('mongoose');

const storageFacilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ['ambient', 'cold', 'silo', 'warehouse'],
      required: true,
    },
    // Location
    lga: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
    // Capacity
    totalCapacityKg: {
      type: Number,
      required: true,
    },
    availableCapacityKg: {
      type: Number,
      required: true,
    },
    // Pricing (per day per kg or flat)
    pricePerKgPerDay: {
      type: Number,
      required: true,
    },
    minBookingDays: {
      type: Number,
      default: 1,
    },
    // Features
    features: [{
      type: String, // e.g. "pest control", "24/7 security", "loading bay"
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    // Owner / operator
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    images: [{
      type: String,
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('StorageFacility', storageFacilitySchema);

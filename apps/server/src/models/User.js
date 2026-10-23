const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['farmer', 'extension_officer', 'storage_operator', 'admin', 'super_admin'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'farmer',
    },
    // Farmer specific
    lga: {
      type: String,
      trim: true,
    },
    crops: [{
      type: String,
    }],
    irrigationStatus: {
      type: String,
      enum: ['none', 'partial', 'full'],
      default: 'none',
    },
    // Extension officer / storage operator
    organization: {
      type: String,
      trim: true,
    },
    // Google Auth
    googleId: {
      type: String,
      sparse: true,
    },
    avatar: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Hide sensitive fields
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;

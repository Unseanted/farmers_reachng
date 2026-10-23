const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        lga: user.lga,
        avatar: user.avatar,
      },
    });
};

// @route   POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['farmer', 'extension_officer', 'storage_operator']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, email, password, phone, role, lga, crops, irrigationStatus, organization } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      // Only allow certain roles on public register
      const allowedRoles = ['farmer', 'extension_officer', 'storage_operator'];
      const finalRole = allowedRoles.includes(role) ? role : 'farmer';

      const user = await User.create({
        name,
        email,
        password,
        phone,
        role: finalRole,
        lga,
        crops: crops || [],
        irrigationStatus: irrigationStatus || 'none',
        organization,
      });

      sendTokenResponse(user, 201, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Registration failed' });
    }
  }
);

// @route   POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      if (!user.isActive) {
        return res.status(401).json({ success: false, message: 'Account is deactivated' });
      }

      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      sendTokenResponse(user, 200, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Login failed' });
    }
  }
);

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// @route   POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.json({ success: true, message: 'Logged out' });
});


// @route   POST /api/auth/google
// @desc    Sign in / sign up with Google ID token
router.post(
  '/google',
  [body('idToken').notEmpty().withMessage('Google ID token is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { idToken, role, phone, lga, crops, irrigationStatus, organization } = req.body;

      // Verify Google ID token
      let payload;
      const clientId = process.env.GOOGLE_CLIENT_ID;

      if (clientId) {
        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(clientId);
        const ticket = await client.verifyIdToken({
          idToken,
          audience: clientId,
        });
        payload = ticket.getPayload();
      } else {
        // Fallback: verify via Google tokeninfo endpoint (works without local lib in some envs)
        const fetch = global.fetch || require('node:https').get;
        const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
        const response = await globalThis.fetch(url);
        if (!response.ok) {
          return res.status(401).json({ success: false, message: 'Invalid Google token' });
        }
        payload = await response.json();
        if (payload.error) {
          return res.status(401).json({ success: false, message: 'Invalid Google token' });
        }
      }

      if (!payload || !payload.email) {
        return res.status(401).json({ success: false, message: 'Could not verify Google account' });
      }

      const { sub: googleId, email, name, picture } = payload;

      let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

      if (user) {
        // Link Google if signing in with existing email account
        if (!user.googleId) {
          user.googleId = googleId;
          if (picture) user.avatar = picture;
          await user.save({ validateBeforeSave: false });
        }
        if (!user.isActive) {
          return res.status(401).json({ success: false, message: 'Account is deactivated' });
        }
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });
        return sendTokenResponse(user, 200, res);
      }

      // New user via Google
      const allowedRoles = ['farmer', 'extension_officer', 'storage_operator'];
      const finalRole = allowedRoles.includes(role) ? role : 'farmer';

      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        googleId,
        avatar: picture,
        role: finalRole,
        phone,
        lga,
        crops: crops || [],
        irrigationStatus: irrigationStatus || 'none',
        organization,
      });

      return sendTokenResponse(user, 201, res);
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).json({ success: false, message: 'Google authentication failed' });
    }
  }
);


module.exports = router;

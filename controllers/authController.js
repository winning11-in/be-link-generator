import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cloudinary from 'cloudinary';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: "dj3xx136b",
  api_key: "526198336185966",
  api_secret: "zIbgT48P52UwvQy-dgc_u8pmrMo",
});

// Configure multer for profile picture upload (memory storage for Cloudinary)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 // 1MB limit
  }
});

export const uploadProfilePicture = upload.single('profilePicture');


// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        theme: user.theme,
        mobile: user.mobile,
        country: user.country,
        city: user.city,
        profilePicture: user.profilePicture,
        language: user.language,
        timezone: user.timezone,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user
// @route   POST /api/auth/signin
// @access  Public
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.blocked) {
      return res.status(403).json({ message: 'Account is blocked, contact support' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      theme: user.theme,
      mobile: user.mobile,
      country: user.country,
      city: user.city,
      profilePicture: user.profilePicture,
      language: user.language,
      timezone: user.timezone,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        theme: user.theme,
        mobile: user.mobile,
        country: user.country,
        city: user.city,
        profilePicture: user.profilePicture,
        language: user.language,
        timezone: user.timezone,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, mobile, country, city, language, timezone } = req.body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const updateData = {
      name: name.trim(),
      mobile: mobile ? mobile.trim() : undefined,
      country: country ? country.trim() : undefined,
      city: city ? city.trim() : undefined,
      language: language || 'en',
      timezone: timezone || 'UTC',
    };

    // Handle profile picture upload/removal
    if (req.file) {
      try {
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.v2.uploader.upload_stream(
            {
              folder: 'qr-craft-profiles',
              public_id: `profile-${req.user._id}-${Date.now()}`,
              transformation: [
                { width: 200, height: 200, crop: 'fill' },
                { quality: 'auto' }
              ]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });

        updateData.profilePicture = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload profile picture' });
      }
    } else if (req.body.profilePicture === '') {
      // Remove profile picture
      updateData.profilePicture = null;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    if (user) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          theme: user.theme,
          mobile: user.mobile,
          country: user.country,
          city: user.city,
          profilePicture: user.profilePicture,
          language: user.language,
          timezone: user.timezone,
          createdAt: user.createdAt,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user theme
// @route   PUT /api/auth/theme
// @access  Private
export const updateTheme = async (req, res) => {
  try {
    const { theme } = req.body;

    // Validate theme
    const validThemes = ['purple', 'blue', 'green', 'orange', 'rose', 'slate', 'teal', 'indigo', 'emerald', 'cyan', 'violet', 'fuchsia', 'gradient_sunset', 'gradient_ocean', 'gradient_forest', 'gradient_royal'];
    if (!validThemes.includes(theme)) {
      return res.status(400).json({ message: 'Invalid theme' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { theme },
      { new: true }
    ).select('-password');

    if (user) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          theme: user.theme,
          createdAt: user.createdAt,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user._1d || req.user._id).select('+password');
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth authentication
// @route   POST /api/auth/google-auth
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // Decode Google credential (JWT token)
    // The credential is a JWT with 3 parts: header.payload.signature
    const payload = JSON.parse(Buffer.from(credential.split('.')[1], 'base64').toString());

    // Verify essential fields
    if (!payload.email || !payload.sub) {
      return res.status(400).json({ message: 'Invalid Google credential' });
    }

    // Check if user exists
    let user = await User.findOne({ email: payload.email.toLowerCase() });

    if (!user) {
      // Create new user with Google info
      user = await User.create({
        email: payload.email.toLowerCase(),
        googleId: payload.sub,
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture,
        isVerified: true, // Google accounts are pre-verified
        profilePicture: payload.picture, // Store in both fields for consistency
      });
    } else {
      // User exists - update Google info if not already set
      if (!user.googleId) {
        user.googleId = payload.sub;
        user.name = user.name || payload.name || payload.email.split('@')[0];
        user.picture = payload.picture;
        user.isVerified = true;
        user.profilePicture = user.profilePicture || payload.picture;
        await user.save();
      }
    }

    // Check if user is blocked
    if (user.blocked) {
      return res.status(403).json({ message: 'Account is blocked, contact support' });
    }

    // Return user data with token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      theme: user.theme,
      mobile: user.mobile,
      country: user.country,
      city: user.city,
      profilePicture: user.profilePicture || user.picture,
      picture: user.picture,
      language: user.language,
      timezone: user.timezone,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed', error: error.message });
  }
};







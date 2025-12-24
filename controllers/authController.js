import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

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

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        theme: user.theme,
        mobile: user.mobile,
        country: user.country,
        city: user.city,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
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
    const { name, mobile, country, city } = req.body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        name: name.trim(),
        mobile: mobile ? mobile.trim() : undefined,
        country: country ? country.trim() : undefined,
        city: city ? city.trim() : undefined,
      },
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
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Setup Two-Factor (generate QR and temp secret)
// @route   POST /api/auth/2fa/setup
// @access  Private
export const setupTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const secret = speakeasy.generateSecret({ name: `QR Craft Studio (${user.email})` });
    user.twoFactorTempSecret = secret.base32;
    await user.save();

    const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.json({ qrCodeDataUrl: qrDataUrl, base32: secret.base32 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Two-Factor token and enable 2FA
// @route   POST /api/auth/2fa/verify
// @access  Private
export const verifyTwoFactor = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token is required' });

    const user = await User.findById(req.user._id).select('+twoFactorTempSecret');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const secret = user.twoFactorTempSecret;
    const verified = speakeasy.totp.verify({ secret, encoding: 'base32', token, window: 1 });

    if (!verified) return res.status(400).json({ message: 'Invalid token' });

    user.twoFactorEnabled = true;
    user.twoFactorSecret = user.twoFactorTempSecret;
    user.twoFactorTempSecret = undefined;
    await user.save();

    res.json({ success: true, message: 'Two-Factor Authentication enabled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Disable Two-Factor
// @route   POST /api/auth/2fa/disable
// @access  Private
export const disableTwoFactor = async (req, res) => {
  try {
    const { token, currentPassword } = req.body;
    const user = await User.findById(req.user._id).select('+twoFactorSecret +password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Try token first
    if (token) {
      const verified = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token, window: 1 });
      if (!verified) return res.status(400).json({ message: 'Invalid token' });
    } else if (currentPassword) {
      if (!(await user.matchPassword(currentPassword))) {
        return res.status(401).json({ message: 'Password is incorrect' });
      }
    } else {
      return res.status(400).json({ message: 'Provide token or current password to disable 2FA' });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorTempSecret = undefined;
    await user.save();

    res.json({ success: true, message: 'Two-Factor Authentication disabled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

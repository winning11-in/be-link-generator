import express from 'express';
import { signup, signin, getProfile, updateTheme, updateProfile, changePassword, setupTwoFactor, verifyTwoFactor, disableTwoFactor } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Async wrapper to forward errors to Express error handler
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/profile', protect, getProfile);
router.get('/me', protect, getProfile);
router.put('/theme', protect, updateTheme);
router.put('/profile', protect, updateProfile);

// Password and 2FA
router.put('/password', protect, asyncHandler(changePassword));
router.post('/2fa/setup', protect, asyncHandler(setupTwoFactor));
router.post('/2fa/verify', protect, asyncHandler(verifyTwoFactor));
router.post('/2fa/disable', protect, asyncHandler(disableTwoFactor));

export default router;

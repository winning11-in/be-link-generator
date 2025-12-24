import express from 'express';
import { signup, signin, getProfile, updateTheme, updateProfile, changePassword, setupTwoFactor, verifyTwoFactor, disableTwoFactor } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/profile', protect, getProfile);
router.get('/me', protect, getProfile);
router.put('/theme', protect, updateTheme);
router.put('/profile', protect, updateProfile);

// Password and 2FA
router.put('/password', protect, changePassword);
router.post('/2fa/setup', protect, setupTwoFactor);
router.post('/2fa/verify', protect, verifyTwoFactor);
router.post('/2fa/disable', protect, disableTwoFactor);

export default router;

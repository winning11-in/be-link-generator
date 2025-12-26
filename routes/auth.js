import express from 'express';
import { signup, signin, getProfile, updateTheme, updateProfile, changePassword, uploadProfilePicture, googleAuth } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Async wrapper to forward errors to Express error handler
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google-auth', googleAuth);
router.get('/profile', protect, getProfile);
router.get('/me', protect, getProfile);
router.put('/theme', protect, updateTheme);
router.put('/profile', protect, uploadProfilePicture, updateProfile);

// Password
router.put('/password', protect, asyncHandler(changePassword));

export default router;

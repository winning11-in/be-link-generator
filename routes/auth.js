import express from 'express';
import { signup, signin, getProfile, getCurrentUser, updateTheme } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/profile', protect, getProfile);
router.get('/me', protect, getCurrentUser);
router.put('/theme', protect, updateTheme);

export default router;

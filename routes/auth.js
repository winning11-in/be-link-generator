import express from 'express';
import { signup, signin, getProfile, getCurrentUser } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/profile', protect, getProfile);
router.get('/me', protect, getCurrentUser);

export default router;

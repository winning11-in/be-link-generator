import express from 'express';
import { getUserScans } from '../controllers/scanController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all scans for current user
router.get('/', protect, getUserScans);

// Get aggregated analytics for current user
router.get('/analytics', protect, getUserAnalytics);

export default router;

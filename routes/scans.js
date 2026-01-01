import express from 'express';
import { getUserScans, getUserAnalytics } from '../controllers/scanController.js';
import { getAllAdvancedAnalytics, getHeatmapData, getPeakTimes, getRetentionAnalysis, getReferrerAnalysis } from '../controllers/advancedAnalyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all scans for current user
router.get('/', protect, getUserScans);

// Get aggregated analytics for current user
router.get('/analytics', protect, getUserAnalytics);

// Advanced analytics - Single endpoint for all
router.get('/analytics/advanced/:id?', protect, getAllAdvancedAnalytics);

// Individual advanced analytics endpoints (kept for backward compatibility)
router.get('/analytics/heatmap/:id?', protect, getHeatmapData);
router.get('/analytics/peak-times/:id?', protect, getPeakTimes);
router.get('/analytics/retention/:id?', protect, getRetentionAnalysis);
router.get('/analytics/referrers/:id?', protect, getReferrerAnalysis);

export default router;

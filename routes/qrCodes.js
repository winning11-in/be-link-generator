import express from 'express';
import {
  createQRCode,
  getUserQRCodes,
  getQRCode,
  updateQRCode,
  deleteQRCode,
  incrementScan,
  getStats,
} from '../controllers/qrCodeController.js';
import {
  getQRCodeScans,
  getQRCodeAnalytics,
} from '../controllers/scanController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Stats endpoint (must be before /:id routes)
router.get('/stats', protect, getStats);

router.route('/')
  .get(protect, getUserQRCodes)
  .post(protect, createQRCode);

router.route('/:id')
  .get(getQRCode)  // Make public so scan redirect can fetch QR data
  .put(protect, updateQRCode)
  .delete(protect, deleteQRCode);

// Scan tracking (public endpoint)
router.post('/:id/scan', incrementScan);

// Analytics endpoints (protected)
router.get('/:id/scans', protect, getQRCodeScans);
router.get('/:id/analytics', protect, getQRCodeAnalytics);

export default router;

import express from 'express';
import {
  createQRCode,
  getUserQRCodes,
  getQRCode,
  updateQRCode,
  deleteQRCode,
  incrementScan,
} from '../controllers/qrCodeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getUserQRCodes)
  .post(protect, createQRCode);

router.route('/:id')
  .get(protect, getQRCode)
  .put(protect, updateQRCode)
  .delete(protect, deleteQRCode);

router.put('/:id/scan', incrementScan);

export default router;

import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getPlans,
  createOrder,
  verifyPayment,
  getSubscription,
  getPaymentHistory,
  cancelSubscription
} from '../controllers/paymentController.js';

const router = express.Router();

// Get available plans (public route)
router.get('/plans', getPlans);

// Protected routes
router.post('/create-order', auth, createOrder);
router.post('/verify', auth, verifyPayment);
router.get('/subscription', auth, getSubscription);
router.get('/history', auth, getPaymentHistory);
router.post('/cancel', auth, cancelSubscription);

export default router;
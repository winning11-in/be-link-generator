import express from 'express';
import { getAllUsersData, blockUser, deleteUser, enforceUserLimits, getSystemStats, getSubscriptionsData } from '../controllers/adminController.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/users', adminMiddleware, getAllUsersData);
router.put('/users/:id', adminMiddleware, blockUser);
router.delete('/users/:id', adminMiddleware, deleteUser);

// New admin endpoints for subscription management
router.get('/stats', adminMiddleware, getSystemStats);
router.get('/subscriptions', adminMiddleware, getSubscriptionsData);
router.post('/enforce-limits', adminMiddleware, enforceUserLimits);

export default router;
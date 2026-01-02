import express from 'express';
import { getAllUsersData, blockUser, deleteUser } from '../controllers/adminController.js';
import { getLogs, cleanupLogs } from '../controllers/logController.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/users', adminMiddleware, getAllUsersData);
router.put('/users/:id', adminMiddleware, blockUser);
router.delete('/users/:id', adminMiddleware, deleteUser);

// Logs routes
router.get('/logs', adminMiddleware, getLogs);
router.delete('/logs/cleanup', adminMiddleware, cleanupLogs);

export default router;
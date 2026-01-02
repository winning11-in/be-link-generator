import express from 'express';
import { getAllUsersData, blockUser, deleteUser } from '../controllers/adminController.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/users', adminMiddleware, getAllUsersData);
router.put('/users/:id', adminMiddleware, blockUser);
router.delete('/users/:id', adminMiddleware, deleteUser);

export default router;
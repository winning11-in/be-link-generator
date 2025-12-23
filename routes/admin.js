import express from 'express';
import { getAllUsersData } from '../controllers/adminController.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/users', adminMiddleware, getAllUsersData);

export default router;
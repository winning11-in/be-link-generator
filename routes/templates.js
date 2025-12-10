import express from 'express';
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getAdminTemplates,
  getTemplatesByCategory,
  incrementTemplateUsage,
} from '../controllers/templateController.js';
import { verifyToken } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllTemplates);
router.get('/category/:category', getTemplatesByCategory);
router.get('/:id', getTemplateById);
router.post('/:id/usage', incrementTemplateUsage);

// Protected routes (Admin only)
router.post('/', verifyToken, adminMiddleware, createTemplate);
router.put('/:id', verifyToken, adminMiddleware, updateTemplate);
router.delete('/:id', verifyToken, adminMiddleware, deleteTemplate);

// Admin management route
router.get('/admin/all', verifyToken, adminMiddleware, getAdminTemplates);

export default router;

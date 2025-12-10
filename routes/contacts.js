import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  createContact,
  getAllContacts,
  updateContactStatus,
  deleteContact,
} from '../controllers/contactController.js';

const router = express.Router();

router.post('/', createContact);
router.get('/', protect, admin, getAllContacts);
router.put('/:id', protect, admin, updateContactStatus);
router.delete('/:id', protect, admin, deleteContact);

export default router;

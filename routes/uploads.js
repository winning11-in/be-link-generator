import express from 'express';
import { uploadLogo } from '../controllers/uploadController.js';

const router = express.Router();

// Upload a logo (accepts base64 data URL in JSON)
router.post('/logo', uploadLogo);

export default router;

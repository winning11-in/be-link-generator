import express from 'express';
import { redirectToContent } from '../controllers/redirectController.js';

const router = express.Router();

router.get('/:id', redirectToContent);

export default router;

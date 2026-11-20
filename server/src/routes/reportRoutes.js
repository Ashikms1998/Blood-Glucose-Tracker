import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getReports } from '../controllers/reportController.js';

const router = Router();

router.use(authenticate);
router.get('/', getReports);

export default router;
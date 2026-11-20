import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  getReadings, createReading,updateReading,deleteReading} from '../controllers/readingController.js';

const router = Router();

router.use(authenticate);

router.get('/', getReadings);
router.post('/', createReading);
router.put('/:id', updateReading);
router.delete('/:id', deleteReading);

export default router;
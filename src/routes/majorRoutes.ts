import { Router } from 'express';
import {
  getAllMajors,
  getMajorById,
  createMajor,
  updateMajor,
  deleteMajor,
} from '../controllers/majorController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Route Publik
router.get('/', getAllMajors);
router.get('/:id', getMajorById);

// Route Protected (Harus Login)
router.post('/', authenticateToken, createMajor);
router.put('/:id', authenticateToken, updateMajor);
router.delete('/:id', authenticateToken, deleteMajor);

export default router;
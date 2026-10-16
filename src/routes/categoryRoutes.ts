import { Router } from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Public Routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Protected Routes (Butuh Login)
router.post('/', authenticateToken, createCategory);
router.put('/:id', authenticateToken, updateCategory);
router.delete('/:id', authenticateToken, deleteCategory);

export default router;
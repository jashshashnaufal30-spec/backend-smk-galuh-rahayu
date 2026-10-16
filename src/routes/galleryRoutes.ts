import { Router } from 'express';
import {
  getAllGalleries,
  getGalleryById,
  createGallery,
  updateGallery,
  deleteGallery,
} from '../controllers/galleryController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Public Routes
router.get('/', getAllGalleries);
router.get('/:id', getGalleryById);

// Protected Routes (Butuh Login)
router.post('/', authenticateToken, createGallery);
router.put('/:id', authenticateToken, updateGallery);
router.delete('/:id', authenticateToken, deleteGallery);

export default router;
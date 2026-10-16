import { Router } from 'express';
import { getPosts, createPost, updatePost, deletePost, getPostBySlug } from '../controllers/postController';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

// Endpoint Publik
router.get('/', getPosts);
router.get('/:slug', getPostBySlug);

// Endpoint Terproteksi (Admin Berita & Super Admin)
router.post('/', authenticateToken, authorizeRoles('super_admin', 'admin_berita'), createPost);
router.put('/:id', authenticateToken, authorizeRoles('super_admin', 'admin_berita'), updatePost);
router.delete('/:id', authenticateToken, authorizeRoles('super_admin', 'admin_berita'), deletePost);

export default router;
import { Router } from 'express';
import {
  createContact,
  getAllContacts,
  markContactAsRead,
  deleteContact,
} from '../controllers/contactController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Public Route (Pengunjung kirim pesan)
router.post('/', createContact);

// Protected Routes (Admin baca & kelola)
router.get('/', authenticateToken, getAllContacts);
router.put('/:id/read', authenticateToken, markContactAsRead);
router.delete('/:id', authenticateToken, deleteContact);

export default router;
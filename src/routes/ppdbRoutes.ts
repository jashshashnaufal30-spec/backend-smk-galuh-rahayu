import { Router } from 'express';
import {
  createRegistration,
  getAllRegistrations,
  getRegistrationById,
  updateRegistrationStatus,
  deleteRegistration,
} from '../controllers/ppdbController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Public Route (Calon Siswa Daftar)
router.post('/', createRegistration);

// Protected Routes (Admin Kelola Data)
router.get('/', authenticateToken, getAllRegistrations);
router.get('/:id', authenticateToken, getRegistrationById);
router.put('/:id/status', authenticateToken, updateRegistrationStatus);
router.delete('/:id', authenticateToken, deleteRegistration);

export default router;
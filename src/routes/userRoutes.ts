import { Router } from 'express';
import { getUsers, createUser, updateUserRole, resetUserPassword, deleteUser } from '../controllers/userController';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

// Semua endpoint user diproteksi khusus super_admin
router.use(authenticateToken, authorizeRoles('super_admin'));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id/role', updateUserRole);
router.put('/:id/reset-password', resetUserPassword);
router.delete('/:id', deleteUser);

export default router;
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper format BigInt ke Number
const formatUser = (user: any) => {
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    id: Number(user.id),
  };
};

// 1. Get All Users (Super Admin Only)
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      message: 'Berhasil mengambil daftar user',
      data: users.map(formatUser),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data user', error: error.message });
  }
};

// 2. Create User Admin (Super Admin Only)
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    res.status(201).json({
      success: true,
      message: 'User admin berhasil ditambahkan',
      data: formatUser(newUser),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Gagal menambahkan user', error: error.message });
  }
};

// 3. Update Role User (Super Admin Only)
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id as string;
    const { role } = req.body;

    if (!role) {
      res.status(400).json({ success: false, message: 'Role wajib diisi' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: BigInt(idParam) },
      data: { role },
    });

    res.json({
      success: true,
      message: 'Peran user berhasil diperbarui',
      data: formatUser(updatedUser),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui role user', error: error.message });
  }
};

// 4. Reset Password User (Super Admin Only)
export const resetUserPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id as string;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: BigInt(idParam) },
      data: { password: hashedPassword },
    });

    res.json({
      success: true,
      message: 'Password user berhasil direset',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Gagal mereset password', error: error.message });
  }
};

// 5. Delete User (Super Admin Only)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id as string;

    await prisma.user.delete({
      where: { id: BigInt(idParam) },
    });

    res.json({
      success: true,
      message: 'User berhasil dihapus',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Gagal menghapus user', error: error.message });
  }
};
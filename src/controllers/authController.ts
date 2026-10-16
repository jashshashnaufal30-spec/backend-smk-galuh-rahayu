import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_smk_galuh';

// Helper untuk mengubah tipe BigInt menjadi Number agar bisa di-serialize ke JSON
const formatUser = (user: any) => {
  const { password, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    id: Number(user.id),
  };
};

// Register User Baru
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Default role disesuaikan dengan Enum di schema.prisma: super_admin, admin_berita, atau admin_ppdb
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'admin_berita', 
      },
    });

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: formatUser(newUser),
    });
  } catch (error: any) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error?.message || error,
    });
  }
};

// Login User
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ success: false, message: 'Email atau password salah' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: 'Email atau password salah' });
      return;
    }

    const userIdNumber = Number(user.id);

    const token = jwt.sign(
      { id: userIdNumber, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: formatUser(user),
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error?.message || error,
    });
  }
};

// Get Profil User Login (Protected Route)
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const reqAny = req as any;
    if (!reqAny.user || !reqAny.user.id) {
      res.status(401).json({ success: false, message: 'Akses tidak diizinkan' });
      return;
    }

    const userId = reqAny.user.id;

    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      return;
    }

    res.json({ success: true, data: formatUser(user) });
  } catch (error: any) {
    console.error('GetMe Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error?.message || error,
    });
  }
};

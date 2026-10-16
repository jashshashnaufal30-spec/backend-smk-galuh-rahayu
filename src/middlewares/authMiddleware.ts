import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interface untuk menambahkan properti user pada Request Express
export interface AuthRequest extends Request {
  user?: {
    id: number | string;
    email: string;
    role: 'super_admin' | 'admin_ppdb' | 'admin_berita';
    [key: string]: any;
  };
}

// 1. Middleware untuk Verifikasi Token JWT
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Akses ditolak, token tidak ditemukan' });
    return;
  }

  const secret = process.env.JWT_SECRET || 'secret_key_smk_galuh';

  jwt.verify(token, secret, (err: any, decoded: any) => {
    if (err || !decoded) {
      res.status(403).json({ success: false, message: 'Token tidak valid atau kadaluwarsa' });
      return;
    }

    req.user = decoded;
    next();
  });
};

// 2. Middleware untuk Pembatasan Hak Akses berdasarkan Role
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(401).json({ success: false, message: 'Otentikasi diperlukan' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Akses ditolak! Anda tidak memiliki izin untuk melakukan tindakan ini',
      });
      return;
    }

    next();
  };
};
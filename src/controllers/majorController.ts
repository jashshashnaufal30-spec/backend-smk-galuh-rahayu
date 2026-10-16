import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper untuk merubah BigInt ke Number sebelum dikirim ke JSON
const formatMajor = (major: any) => {
  if (!major) return null;
  return {
    ...major,
    id: Number(major.id),
  };
};

// 1. Get All Majors (Public)
export const getAllMajors = async (req: Request, res: Response): Promise<void> => {
  try {
    const majors = await prisma.major.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const formattedMajors = majors.map(formatMajor);

    res.json({
      success: true,
      message: 'Berhasil mengambil daftar jurusan',
      data: formattedMajors,
    });
  } catch (error: any) {
    console.error('Get All Majors Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error?.message || error,
    });
  }
};

// 2. Get Major By ID (Public)
export const getMajorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id as string;
    const majorId = BigInt(idParam);

    const major = await prisma.major.findUnique({
      where: { id: majorId },
    });

    if (!major) {
      res.status(404).json({ success: false, message: 'Jurusan tidak ditemukan' });
      return;
    }

    res.json({
      success: true,
      message: 'Berhasil mengambil detail jurusan',
      data: formatMajor(major),
    });
  } catch (error: any) {
    console.error('Get Major By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error?.message || error,
    });
  }
};

// 3. Create Major (Protected: Admin)
export const createMajor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, name, slug, description, headOfMajor, image } = req.body;

    if (!code || !name || !slug) {
      res.status(400).json({
        success: false,
        message: 'Kode (code), nama jurusan (name), dan slug wajib diisi',
      });
      return;
    }

    const existingCode = await prisma.major.findUnique({ where: { code } });
    if (existingCode) {
      res.status(400).json({ success: false, message: 'Kode jurusan sudah digunakan' });
      return;
    }

    const existingSlug = await prisma.major.findUnique({ where: { slug } });
    if (existingSlug) {
      res.status(400).json({ success: false, message: 'Slug jurusan sudah digunakan' });
      return;
    }

    const newMajor = await prisma.major.create({
      data: {
        code,
        name,
        slug,
        description: description || null,
        headOfMajor: headOfMajor || null,
        image: image || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Jurusan berhasil ditambahkan',
      data: formatMajor(newMajor),
    });
  } catch (error: any) {
    console.error('Create Major Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error?.message || error,
    });
  }
};

// 4. Update Major (Protected: Admin)
export const updateMajor = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id as string;
    const majorId = BigInt(idParam);
    const { code, name, slug, description, headOfMajor, image } = req.body;

    const existingMajor = await prisma.major.findUnique({
      where: { id: majorId },
    });

    if (!existingMajor) {
      res.status(404).json({ success: false, message: 'Jurusan tidak ditemukan' });
      return;
    }

    const updatedMajor = await prisma.major.update({
      where: { id: majorId },
      data: {
        code: code || existingMajor.code,
        name: name || existingMajor.name,
        slug: slug || existingMajor.slug,
        description: description !== undefined ? description : existingMajor.description,
        headOfMajor: headOfMajor !== undefined ? headOfMajor : existingMajor.headOfMajor,
        image: image !== undefined ? image : existingMajor.image,
      },
    });

    res.json({
      success: true,
      message: 'Jurusan berhasil diperbarui',
      data: formatMajor(updatedMajor),
    });
  } catch (error: any) {
    console.error('Update Major Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error?.message || error,
    });
  }
};

// 5. Delete Major (Protected: Admin)
export const deleteMajor = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id as string;
    const majorId = BigInt(idParam);

    const existingMajor = await prisma.major.findUnique({
      where: { id: majorId },
    });

    if (!existingMajor) {
      res.status(404).json({ success: false, message: 'Jurusan tidak ditemukan' });
      return;
    }

    await prisma.major.delete({
      where: { id: majorId },
    });

    res.json({
      success: true,
      message: 'Jurusan berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Delete Major Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error?.message || error,
    });
  }
};
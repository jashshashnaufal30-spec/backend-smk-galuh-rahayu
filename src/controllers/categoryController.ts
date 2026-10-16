import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const formatCategory = (category: any) => {
  if (!category) return null;
  return {
    ...category,
    id: Number(category.id),
  };
};

// 1. Get All Categories (Public)
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const formatted = categories.map(formatCategory);

    res.json({
      success: true,
      message: 'Berhasil mengambil daftar kategori',
      data: formatted,
    });
  } catch (error: any) {
    console.error('Get All Categories Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error?.message || error });
  }
};

// 2. Get Category By ID (Public)
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id as string;
    const category = await prisma.category.findUnique({
      where: { id: BigInt(idParam) },
    });

    if (!category) {
      res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
      return;
    }

    res.json({
      success: true,
      message: 'Berhasil mengambil detail kategori',
      data: formatCategory(category),
    });
  } catch (error: any) {
    console.error('Get Category By ID Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error?.message || error });
  }
};

// 3. Create Category (Protected: Admin)
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug } = req.body;

    if (!name || !slug) {
      res.status(400).json({ success: false, message: 'Nama dan slug wajib diisi' });
      return;
    }

    const existingSlug = await prisma.category.findUnique({ where: { slug } });
    if (existingSlug) {
      res.status(400).json({ success: false, message: 'Slug kategori sudah digunakan' });
      return;
    }

    const newCategory = await prisma.category.create({
      data: { name, slug },
    });

    res.status(201).json({
      success: true,
      message: 'Kategori berhasil ditambahkan',
      data: formatCategory(newCategory),
    });
  } catch (error: any) {
    console.error('Create Category Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error?.message || error });
  }
};

// 4. Update Category (Protected: Admin)
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id as string;
    const { name, slug } = req.body;

    const existing = await prisma.category.findUnique({ where: { id: BigInt(idParam) } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
      return;
    }

    const updated = await prisma.category.update({
      where: { id: BigInt(idParam) },
      data: {
        name: name || existing.name,
        slug: slug || existing.slug,
      },
    });

    res.json({
      success: true,
      message: 'Kategori berhasil diperbarui',
      data: formatCategory(updated),
    });
  } catch (error: any) {
    console.error('Update Category Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error?.message || error });
  }
};

// 5. Delete Category (Protected: Admin)
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id as string;

    const existing = await prisma.category.findUnique({ where: { id: BigInt(idParam) } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
      return;
    }

    await prisma.category.delete({ where: { id: BigInt(idParam) } });

    res.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error: any) {
    console.error('Delete Category Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error?.message || error });
  }
};
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const formatGallery = (item: any) => {
  if (!item) return null;
  return {
    ...item,
    id: Number(item.id),
  };
};

// 1. Get All Galleries (Public) - Bisa filter berdasarkan kategori via Query (?category=kegiatan)
export const getAllGalleries = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;

    const whereClause: any = {};
    if (category && ['kegiatan', 'fasilitas', 'prestasi'].includes(category as string)) {
      whereClause.category = category;
    }

    const galleries = await prisma.gallery.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      message: 'Berhasil mengambil data galeri',
      data: galleries.map(formatGallery),
    });
  } catch (error: any) {
    console.error('Get All Galleries Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error?.message || error });
  }
};

// 2. Get Gallery By ID (Public)
export const getGalleryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id as string;

    const gallery = await prisma.gallery.findUnique({
      where: { id: BigInt(idParam) },
    });

    if (!gallery) {
      res.status(404).json({ success: false, message: 'Data galeri tidak ditemukan' });
      return;
    }

    res.json({
      success: true,
      message: 'Berhasil mengambil detail galeri',
      data: formatGallery(gallery),
    });
  } catch (error: any) {
    console.error('Get Gallery By ID Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error?.message || error });
  }
};

// 3. Create Gallery Item (Protected: Admin)
export const createGallery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, caption, imagePath, category } = req.body;

    if (!title || !imagePath) {
      res.status(400).json({
        success: false,
        message: 'Judul (title) dan path gambar (imagePath) wajib diisi',
      });
      return;
    }

    const newGallery = await prisma.gallery.create({
      data: {
        title,
        caption: caption || null,
        imagePath,
        category: category || 'kegiatan',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Foto galeri berhasil ditambahkan',
      data: formatGallery(newGallery),
    });
  } catch (error: any) {
    console.error('Create Gallery Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error?.message || error });
  }
};

// 4. Update Gallery Item (Protected: Admin)
export const updateGallery = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id as string;
    const { title, caption, imagePath, category } = req.body;

    const existing = await prisma.gallery.findUnique({
      where: { id: BigInt(idParam) },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Data galeri tidak ditemukan' });
      return;
    }

    const updated = await prisma.gallery.update({
      where: { id: BigInt(idParam) },
      data: {
        title: title || existing.title,
        caption: caption !== undefined ? caption : existing.caption,
        imagePath: imagePath || existing.imagePath,
        category: category || existing.category,
      },
    });

    res.json({
      success: true,
      message: 'Data galeri berhasil diperbarui',
      data: formatGallery(updated),
    });
  } catch (error: any) {
    console.error('Update Gallery Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error?.message || error });
  }
};

// 5. Delete Gallery Item (Protected: Admin)
export const deleteGallery = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id as string;

    const existing = await prisma.gallery.findUnique({
      where: { id: BigInt(idParam) },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Data galeri tidak ditemukan' });
      return;
    }

    await prisma.gallery.delete({
      where: { id: BigInt(idParam) },
    });

    res.json({ success: true, message: 'Data galeri berhasil dihapus' });
  } catch (error: any) {
    console.error('Delete Gallery Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error?.message || error });
  }
};
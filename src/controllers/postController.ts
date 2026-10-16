import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper untuk format BigInt ke Number & relasi data
const formatPost = (post: any) => {
  if (!post) return null;
  return {
    ...post,
    id: Number(post.id),
    userId: Number(post.userId),
    categoryId: Number(post.categoryId),
    user: post.user ? { ...post.user, id: Number(post.user.id) } : undefined,
    category: post.category ? { ...post.category, id: Number(post.category.id) } : undefined,
  };
};

// 1. Get All Posts (Public) - Diexport sebagai getPosts agar sesuai rute
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      message: 'Berhasil mengambil daftar berita',
      data: posts.map(formatPost),
    });
  } catch (error: any) {
    console.error('Get All Posts Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error?.message || error });
  }
};

// Alias untuk kompatibilitas
export const getAllPosts = getPosts;

// 2. Get Post By ID (Public)
export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id as string;

    const post = await prisma.post.findFirst({
      where: { id: BigInt(idParam) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!post) {
      res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
      return;
    }

    // Tambahkan 1 jumlah views
    await prisma.post.update({
      where: { id: BigInt(idParam) },
      data: { views: post.views + 1 },
    });

    res.json({
      success: true,
      message: 'Berhasil mengambil detail berita',
      data: formatPost(post),
    });
  } catch (error: any) {
    console.error('Get Post By ID Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error?.message || error });
  }
};

// 3. Get Post By Slug (Public) - Menggunakan findFirst untuk menghindari error tipe slug
export const getPostBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const post = await prisma.post.findFirst({
      where: { slug: String(slug) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!post) {
      res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
      return;
    }

    // Tambahkan 1 jumlah views
    await prisma.post.update({
      where: { id: post.id },
      data: { views: post.views + 1 },
    });

    res.json({
      success: true,
      message: 'Berhasil mengambil detail berita',
      data: formatPost(post),
    });
  } catch (error: any) {
    console.error('Get Post By Slug Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail berita', error: error?.message || error });
  }
};

// 4. Create Post (Protected: Admin)
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const reqAny = req as any;
    const userId = reqAny.user?.id || 1;

    const { categoryId, title, slug, body, featuredImage, status } = req.body;

    if (!title || !slug || !body) {
      res.status(400).json({
        success: false,
        message: 'Judul (title), slug, dan isi berita (body) wajib diisi',
      });
      return;
    }

    const existingSlug = await prisma.post.findFirst({ where: { slug } });
    if (existingSlug) {
      res.status(400).json({ success: false, message: 'Slug berita sudah digunakan' });
      return;
    }

    const targetCategoryId = categoryId ? BigInt(categoryId) : BigInt(1);

    const newPost = await prisma.post.create({
      data: {
        userId: BigInt(userId),
        categoryId: targetCategoryId,
        title,
        slug,
        body,
        featuredImage: featuredImage || null,
        status: status || 'published',
        publishedAt: status === 'draft' ? null : new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Berita berhasil ditambahkan',
      data: formatPost(newPost),
    });
  } catch (error: any) {
    console.error('Create Post Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error?.message || error });
  }
};

// 5. Update Post (Protected: Admin)
export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id as string;
    const { categoryId, title, slug, body, featuredImage, status } = req.body;

    const existingPost = await prisma.post.findUnique({ where: { id: BigInt(idParam) } });
    if (!existingPost) {
      res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
      return;
    }

    const updatedPost = await prisma.post.update({
      where: { id: BigInt(idParam) },
      data: {
        categoryId: categoryId ? BigInt(categoryId) : existingPost.categoryId,
        title: title || existingPost.title,
        slug: slug || existingPost.slug,
        body: body || existingPost.body,
        featuredImage: featuredImage !== undefined ? featuredImage : existingPost.featuredImage,
        status: status || existingPost.status,
        publishedAt: status === 'published' && !existingPost.publishedAt ? new Date() : existingPost.publishedAt,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    res.json({
      success: true,
      message: 'Berita berhasil diperbarui',
      data: formatPost(updatedPost),
    });
  } catch (error: any) {
    console.error('Update Post Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error?.message || error });
  }
};

// 6. Delete Post (Protected: Admin)
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id as string;

    const existingPost = await prisma.post.findUnique({ where: { id: BigInt(idParam) } });
    if (!existingPost) {
      res.status(404).json({ success: false, message: 'Berita tidak ditemukan' });
      return;
    }

    await prisma.post.delete({ where: { id: BigInt(idParam) } });

    res.json({ success: true, message: 'Berita berhasil dihapus' });
  } catch (error: any) {
    console.error('Delete Post Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error?.message || error });
  }
};
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const formatContact = (contact: any) => {
  if (!contact) return null;
  return {
    ...contact,
    id: Number(contact.id),
  };
};

// 1. Submit Contact Message (Public / Pengunjung Website)
export const createContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).json({
        success: false,
        message: 'Nama, email, subjek, dan pesan wajib diisi',
      });
      return;
    }

    const newContact = await prisma.contact.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Pesan berhasil dikirim',
      data: formatContact(newContact),
    });
  } catch (error: any) {
    console.error('Create Contact Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error?.message || error });
  }
};

// 2. Get All Contact Messages (Protected: Admin)
export const getAllContacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      message: 'Berhasil mengambil daftar pesan kontak',
      data: contacts.map(formatContact),
    });
  } catch (error: any) {
    console.error('Get All Contacts Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error?.message || error });
  }
};

// 3. Mark Message as Read (Protected: Admin)
export const markContactAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id as string;

    const existing = await prisma.contact.findUnique({
      where: { id: BigInt(idParam) },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Pesan tidak ditemukan' });
      return;
    }

    const updated = await prisma.contact.update({
      where: { id: BigInt(idParam) },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: 'Pesan ditandai sudah dibaca',
      data: formatContact(updated),
    });
  } catch (error: any) {
    console.error('Mark Contact As Read Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error?.message || error });
  }
};

// 4. Delete Contact Message (Protected: Admin)
export const deleteContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id as string;

    const existing = await prisma.contact.findUnique({
      where: { id: BigInt(idParam) },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Pesan tidak ditemukan' });
      return;
    }

    await prisma.contact.delete({
      where: { id: BigInt(idParam) },
    });

    res.json({ success: true, message: 'Pesan berhasil dihapus' });
  } catch (error: any) {
    console.error('Delete Contact Error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: error?.message || error });
  }
};
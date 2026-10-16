import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const formatPpdb = (registration: any) => {
  if (!registration) return null;
  return {
    ...registration,
    id: Number(registration.id),
    majorId: Number(registration.majorId),
    major: registration.major ? { ...registration.major, id: Number(registration.major.id) } : undefined,
  };
};

// 1. Submit Registration / Daftar PPDB (Public)
export const createRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      registrationNumber,
      fullName,
      nisn,
      gender,
      placeOfBirth,
      dateOfBirth,
      religion,
      address,
      phoneNumber,
      parentName,
      parentPhone,
      schoolOrigin,
      majorId,
      documentsPath,
      notes,
    } = req.body;

    if (!registrationNumber || !fullName || !nisn || !gender || !placeOfBirth || !dateOfBirth || !religion || !address || !phoneNumber || !parentName || !parentPhone || !schoolOrigin || !majorId) {
      res.status(400).json({
        success: false,
        message: 'Mohon lengkapi semua data wajib (nomor pendaftaran, nama, NISN, gender, tempat/tgl lahir, agama, alamat, no HP, data ortu, asal sekolah, dan jurusan).',
      });
      return;
    }

    const existingReg = await prisma.ppdbRegistration.findUnique({
      where: { registrationNumber },
    });
    if (existingReg) {
      res.status(400).json({ success: false, message: 'Nomor pendaftaran sudah terdaftar' });
      return;
    }

    const existingNisn = await prisma.ppdbRegistration.findUnique({
      where: { nisn },
    });
    if (existingNisn) {
      res.status(400).json({ success: false, message: 'NISN sudah terdaftar' });
      return;
    }

    const newRegistration = await prisma.ppdbRegistration.create({
      data: {
        registrationNumber,
        fullName,
        nisn,
        gender,
        placeOfBirth,
        dateOfBirth: new Date(dateOfBirth),
        religion,
        address,
        phoneNumber,
        parentName,
        parentPhone,
        schoolOrigin,
        majorId: BigInt(majorId),
        documentsPath: documentsPath || null,
        notes: notes || null,
        status: 'pending',
      },
      include: {
        major: { select: { id: true, name: true, code: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Pendaftaran PPDB berhasil diajukan',
      data: formatPpdb(newRegistration),
    });
  } catch (error: any) {
    console.error('Create PPDB Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error?.message || error,
    });
  }
};

// 2. Get All Registrations (Protected: Admin)
export const getAllRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const registrations = await prisma.ppdbRegistration.findMany({
      include: {
        major: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      message: 'Berhasil mengambil daftar pendaftar PPDB',
      data: registrations.map(formatPpdb),
    });
  } catch (error: any) {
    console.error('Get All PPDB Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error?.message || error,
    });
  }
};

// 3. Get Registration By ID (Protected: Admin)
export const getRegistrationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id as string;

    const registration = await prisma.ppdbRegistration.findUnique({
      where: { id: BigInt(idParam) },
      include: {
        major: { select: { id: true, name: true, code: true } },
      },
    });

    if (!registration) {
      res.status(404).json({ success: false, message: 'Data pendaftaran tidak ditemukan' });
      return;
    }

    res.json({
      success: true,
      message: 'Berhasil mengambil detail pendaftar',
      data: formatPpdb(registration),
    });
  } catch (error: any) {
    console.error('Get PPDB By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error?.message || error,
    });
  }
};

// 4. Update Registration Status (Protected: Admin)
export const updateRegistrationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id as string;
    const { status } = req.body;

    if (!status || !['pending', 'verified', 'accepted', 'rejected'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Status tidak valid. Harus pending, verified, accepted, atau rejected',
      });
      return;
    }

    const existing = await prisma.ppdbRegistration.findUnique({
      where: { id: BigInt(idParam) },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Data pendaftaran tidak ditemukan' });
      return;
    }

    const updated = await prisma.ppdbRegistration.update({
      where: { id: BigInt(idParam) },
      data: { status },
      include: {
        major: { select: { id: true, name: true, code: true } },
      },
    });

    res.json({
      success: true,
      message: 'Status pendaftaran berhasil diperbarui',
      data: formatPpdb(updated),
    });
  } catch (error: any) {
    console.error('Update PPDB Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error?.message || error,
    });
  }
};

// 5. Delete Registration (Protected: Admin)
export const deleteRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id as string;

    const existing = await prisma.ppdbRegistration.findUnique({
      where: { id: BigInt(idParam) },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Data pendaftaran tidak ditemukan' });
      return;
    }

    await prisma.ppdbRegistration.delete({
      where: { id: BigInt(idParam) },
    });

    res.json({
      success: true,
      message: 'Data pendaftaran berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Delete PPDB Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error?.message || error,
    });
  }
};
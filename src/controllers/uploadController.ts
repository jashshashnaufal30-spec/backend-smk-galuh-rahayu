import { Request, Response } from 'express';

export const handleSingleUpload = (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah' });
      return;
    }

    // Buat URL publik file yang diunggah
    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(201).json({
      success: true,
      message: 'File berhasil diunggah',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
      },
    });
  } catch (error: any) {
    console.error('Upload Controller Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengunggah file',
      error: error?.message || error,
    });
  }
};
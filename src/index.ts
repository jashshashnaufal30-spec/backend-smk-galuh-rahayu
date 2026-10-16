import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/authRoutes';
import majorRoutes from './routes/majorRoutes';
import categoryRoutes from './routes/categoryRoutes';
import postRoutes from './routes/postRoutes';
import ppdbRoutes from './routes/ppdbRoutes';
import galleryRoutes from './routes/galleryRoutes';
import contactRoutes from './routes/contactRoutes';
import uploadRoutes from './routes/uploadRoutes';
import { errorHandler } from './middlewares/errorMiddleware';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Konfigurasi CORS Fleksibel untuk Frontend (React / Next.js / Vue)
const allowedOrigins = [
  'http://localhost:3000', // Client Next.js / React standar
  'http://localhost:5173', // Client Vite
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Ubah ke callback(new Error('CORS Error')) untuk pembatasan ketat
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serving Folder Uploads secara Publik
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Prefix Endpoint REST API
app.use('/api/auth', authRoutes);
app.use('/api/majors', majorRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/ppdb', ppdbRoutes);
app.use('/api/galleries', galleryRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);

// Health Check Endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API SMK Galuh Rahayu Server is Live and Operational!',
    version: '1.0.0',
  });
});

// Global Error Handler
app.use(errorHandler);

// Jalankan Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
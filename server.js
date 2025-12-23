import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.js';
import qrCodeRoutes from './routes/qrCodes.js';
import scanRoutes from './routes/scans.js';
import contactRoutes from './routes/contacts.js';
import uploadsRoutes from './routes/uploads.js';
import redirectRoutes from './routes/redirects.js';
import adminRoutes from './routes/admin.js';
import { connectDB } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000','http://localhost:3000/', 'http://localhost:5173', 'https://fe-link-generator.vercel.app','http://localhost:8080','https://qr-craft-studio.vercel.app',"https://lovable.dev","https://lovable.dev/projects/1b715cad-150e-47b1-8b6a-2f9b49abf9a1", "https://id-preview--1b715cad-150e-47b1-8b6a-2f9b49abf9a1.lovable.app"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Increase payload size limit to handle base64 encoded images (20MB limit)
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/qrcodes', qrCodeRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/uploads', uploadsRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Redirect route for scanned QR codes (public)
app.use('/r', redirectRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

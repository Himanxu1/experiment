import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import 'reflect-metadata';
import AppDataSource from './config/data-source.js';
import uploadRouter from './routes/upload.js';
import analyzeRouter from './routes/analyze.js';
import authRouter from './routes/auth.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
try {
  await fs.mkdir(uploadsDir, { recursive: true });
} catch (error) {
  console.error('Error creating uploads directory:', error);
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Excel Analytics API is running' });
});

app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/analyze', analyzeRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Initialize database and start server
AppDataSource.initialize()
  .then(() => {
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on http://localhost:${PORT}`);
      console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`🔐 Authentication endpoints: /api/auth/signup, /api/auth/login`);
    });
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });

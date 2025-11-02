import express from 'express';
import dotenv from "dotenv";
import cors from 'cors';
import path from 'path';
import cron from 'node-cron';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import classRoutes from './routes/class.js';
import examRoutes from './routes/exam.js';
import { deleteExpiredClasses } from './controllers/classController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors({ origin: 'https://exam-web-client.onrender.com',credentials: true,}));

app.use(cors({}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/class', classRoutes);
app.use('/api/exam', examRoutes);

// health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Exam Web Server is running' });
});

// Schedule cron job to delete expired classes daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled task: Deleting expired classes');
  await deleteExpiredClasses();
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
  });
}).catch((error) => {
  console.error("Failed to start server:", error);
});

    

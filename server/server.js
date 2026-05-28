import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import boardRoutes from './routes/boards.js';
import taskRoutes from './routes/tasks.js';

dotenv.config();

connectDB();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '[localhost](http://localhost:5173)',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-board', (boardId) => {
    socket.join(`board:${boardId}`);
    console.log(`Socket ${socket.id} joined board:${boardId}`);
  });

  socket.on('leave-board', (boardId) => {
    socket.leave(`board:${boardId}`);
  });

  socket.on('task-update', (data) => {
    socket.to(`board:${data.boardId}`).emit('task-updated', data);
  });

  socket.on('task-move', (data) => {
    socket.to(`board:${data.boardId}`).emit('task-moved', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

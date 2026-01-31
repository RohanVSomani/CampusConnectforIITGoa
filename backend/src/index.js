import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

await connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN.split(','),
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const authMiddleware = (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Unauthorized'));
  }


  next();
};

const namespaces = [
  'notifications',
  'location',
  'carpool',
  'orders',
];

namespaces.forEach((name) => {
  const nsp = io.of(`/${name}`);

  nsp.use(authMiddleware);

  nsp.on('connection', (socket) => {
    console.log(`✅ Socket connected → /${name} : ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected → /${name} : ${socket.id}`);
    });
  });
});

io.on('connection', (socket) => {
  console.log('🌐 Root socket connected:', socket.id);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CampusFlow backend running on port ${PORT}`);
});

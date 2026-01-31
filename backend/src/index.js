import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';
import routes from './routes/index.js';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true,
}));

app.use(express.json());
app.use('/api', routes);

const server = http.createServer(app);

/* 🔥 SINGLE Socket.IO INSTANCE */
const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: process.env.CORS_ORIGIN.split(','),
    credentials: true,
  },
  transports: ['websocket'],
});

initSocket(io);


const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();

    server.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 Server + Socket.IO running on', PORT);
    });
  } catch (err) {
    console.error('❌ Startup failed:', err);
    process.exit(1);
  }
})();

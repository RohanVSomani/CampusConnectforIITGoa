import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN.split(','),
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);

initSocket(io);

async function start() {
  try {
    await connectDB();

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`[CampusFlow AI] Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[CampusFlow AI] Failed to start:', err);
    process.exit(1);
  }
}

start();

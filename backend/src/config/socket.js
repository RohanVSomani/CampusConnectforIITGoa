import { authenticateSocket } from '../middleware/auth.js';
import { notificationHandlers } from '../modules/notifications/socketHandlers.js';
import { locationHandlers } from '../modules/sos/socketHandlers.js';
import { carpoolHandlers } from '../modules/carpool/socketHandlers.js';
import { orderHandlers } from '../modules/orders/socketHandlers.js';
import { chatHandlers, carpoolChatHandlers } from '../modules/chat/socketHandlers.js';

/**
 * @param {import('socket.io').Server} io
 */
export function initSocket(io) {
  console.log('🔥 initSocket() CALLED');

  /* =======================
     COMMON AUTH MIDDLEWARE
  ======================= */
  const authMiddleware = async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No auth token'));

      const user = await authenticateSocket(token);
      if (!user) return next(new Error('Invalid token'));

      socket.user = user;
      next();
    } catch (err) {
      next(err);
    }
  };

  /* 🔔 Notifications */
  const notificationsNs = io.of('/notifications');
  notificationsNs.use(authMiddleware);
  notificationsNs.on('connection', (socket) => {
    console.log('🔔 Notifications socket connected:', socket.id);
    notificationHandlers(notificationsNs, socket);
  });

  /* 💬 Chat */
  const chatNs = io.of('/chat');
  chatNs.use(authMiddleware);
  chatNs.on('connection', (socket) => {
    console.log('💬 Chat socket connected:', socket.id);
    chatHandlers(chatNs, socket);
  });

  /* 📍 Location */
  const locationNs = io.of('/location');
  locationNs.use(authMiddleware);
  locationNs.on('connection', (socket) => {
    console.log('📍 Location socket connected:', socket.id);
    locationHandlers(locationNs, socket);
  });

  /* 🚗 Carpool */
  const carpoolNs = io.of('/carpool');
  carpoolNs.use(authMiddleware);
  carpoolNs.on('connection', (socket) => {
    console.log('🚗 Carpool socket connected:', socket.id);
    carpoolHandlers(carpoolNs, socket);
  });

  /* 💬🚗 Carpool Chat */
  const carpoolChatNs = io.of('/carpool-chat');
  carpoolChatNs.use(authMiddleware);
  carpoolChatNs.on('connection', (socket) => {
    console.log('💬🚗 Carpool chat socket connected:', socket.id);
    carpoolChatHandlers(carpoolChatNs, socket);
  });

  /* 📦 Orders */
  const ordersNs = io.of('/orders');
  ordersNs.use(authMiddleware);
  ordersNs.on('connection', (socket) => {
    console.log('📦 Orders socket connected:', socket.id);
    orderHandlers(ordersNs, socket);
  });

  console.log('✅ All Socket namespaces initialized');
}

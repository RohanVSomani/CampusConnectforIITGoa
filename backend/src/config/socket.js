
import { authenticateSocket } from '../middleware/auth.js';
import { notificationHandlers } from '../modules/notifications/socketHandlers.js';
import { locationHandlers } from '../modules/sos/socketHandlers.js';
import { carpoolHandlers } from '../modules/carpool/socketHandlers.js';
import { orderHandlers } from '../modules/orders/socketHandlers.js';
import { chatHandlers } from '../modules/chat/socketHandlers.js';
import { carpoolChatHandlers } from '../modules/chat/socketHandlers.js';
/**
 * For socket namespace
 * @param {import('socket.io').Server} io
 */
//sockets for 
//noti ,chat , loca, carp, order
export function initSocket(io) {


  const notificationsNs = io.of('/notifications');

  io.notificationsNs = notificationsNs;

  notificationsNs.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      console.log("🔑 Socket token:", token ? "present" : "missing");

      if (!token) return next(new Error("No auth token"));

      const user = await authenticateSocket(token);
      if (!user) return next(new Error("Invalid token"));

      socket.user = user;

      console.log("👤 Socket user:", user._id.toString());
      next();
    } catch (err) {
      console.error("❌ Socket auth error:", err.message);
      next(err);
    }
  });

  notificationsNs.on('connection', (socket) => {
    console.log("🔔 Notifications socket connected:", socket.id);
    notificationHandlers(notificationsNs, socket);
  });


  const chatNs = io.of('/chat');

  chatNs.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) return next(new Error("No auth token"));

      const user = await authenticateSocket(token);
      if (!user) return next(new Error("Invalid token"));

      socket.user = user;
      next();
    } catch (err) {
      next(err);
    }
  });

  chatNs.on('connection', (socket) => {
    console.log("💬 Chat socket connected:", socket.id);
    chatHandlers(chatNs, socket);
  });


  const locationNs = io.of('/location');
  locationNs.on('connection', (socket) => {
    locationHandlers(locationNs, socket);
  });


  const carpoolNs = io.of('/carpool');
  carpoolNs.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    const user = await authenticateSocket(token);
    if (!user) return next(new Error("Auth failed"));
    socket.user = user;
    next();
  });

  carpoolNs.on('connection', (socket) => {
    carpoolHandlers(carpoolNs, socket);
  });

  const carpoolChatNs = io.of('/carpool-chat');
  carpoolChatNs.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    const user = await authenticateSocket(token);
    if (!user) return next(new Error("Auth failed"));
    socket.user = user;
    next();
  });

  carpoolChatNs.on('connection', (socket) => {
    carpoolChatHandlers(carpoolChatNs, socket);
  });

  const ordersNs = io.of('/orders');
  ordersNs.on('connection', (socket) => {
    orderHandlers(ordersNs, socket);
  });

  console.log("✅ All Socket namespaces initialized");

  return io;
}

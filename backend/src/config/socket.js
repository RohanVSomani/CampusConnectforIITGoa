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

  const namespaces = [
    ['notifications', notificationHandlers],
    ['chat', chatHandlers],
    ['location', locationHandlers],
    ['carpool', carpoolHandlers],
    ['carpool-chat', carpoolChatHandlers],
    ['orders', orderHandlers],
  ];

  namespaces.forEach(([name, handler]) => {
    const nsp = io.of(`/${name}`);

    nsp.on('connection', async (socket) => {
      try {
        const token = socket.handshake.auth?.token;
        if (!token) {
          socket.emit('auth_error', 'No auth token');
          return socket.disconnect(true);
        }

        const user = await authenticateSocket(token);
        if (!user) {
          socket.emit('auth_error', 'Invalid token');
          return socket.disconnect(true);
        }

        socket.user = user;
        console.log(`✅ Socket connected → /${name}:`, socket.id);

        handler(nsp, socket);
      } catch (err) {
        socket.disconnect(true);
      }
    });
  });

  console.log('✅ All Socket namespaces initialized');
}

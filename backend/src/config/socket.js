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
      console.log(`🟢 Incoming socket → /${name}`, socket.id);
    
      try {
        const token = socket.handshake.auth?.token;
        /*if (!token) {
          console.log('❌ Disconnect: No token');
          socket.emit('auth_error', 'No token');
          return socket.disconnect(true);
        }*/
    
        let user;
        try {
          user = await authenticateSocket(token);
        } catch (err) {
          console.log('❌ Disconnect: authenticateSocket error', err.message);
          return socket.disconnect(true);
        }
    
        if (!user) {
          console.log('❌ Disconnect: Invalid user');
          return socket.disconnect(true);
        }
    
        socket.user = user;
        console.log(`✅ Auth OK → /${name}`, socket.id);
    
        handler(nsp, socket);
      } catch (err) {
        console.log('❌ Disconnect: Unexpected error', err.message);
        socket.disconnect(true);
      }
    });
    
  });

  console.log('✅ All Socket namespaces initialized');
}

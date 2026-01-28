import { ChatMessage } from '../../models/ChatMessage.js';
import { CarpoolChat } from '../../models/CarPoolSchema.js';
export function chatHandlers(ns, socket) {
  const user = socket.user;

  socket.on('join', ({ matchId }) => {
    socket.join(`match:${matchId}`);
  });

  socket.on('message', async ({ matchId, text }) => {
    const msg = await ChatMessage.create({
      matchId,
      sender: user._id,
      message: text,
    });

    const populated = await msg.populate('sender', 'name');

    ns.to(`match:${matchId}`).emit('message', populated);
  });
}
export function carpoolChatHandlers(ns, socket) {
    const user = socket.user;
  
    socket.on('join', ({ carpoolId }) => {
      socket.join(`carpool-chat:${carpoolId}`);
    });
  
    socket.on('message', async ({ carpoolId, text }) => {
      const msg = await CarpoolChat.create({
        carpoolId,
        sender: user._id,
        message: text,
      });
  
      const populated = await msg.populate('sender', 'name');
  
      ns.to(`carpool-chat:${carpoolId}`).emit('message', populated);
    });
  }
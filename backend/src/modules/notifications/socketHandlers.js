
export function notificationHandlers(ns, socket) {
  console.log("👤 socket.user:", socket.user);

  const userId = socket.user?._id?.toString();

  if (!userId) {
    console.log("❌ No socket.user found");
    return;
  }

  socket.join(`user:${userId}`);

  console.log("🔔 Joined notification room:", `user:${userId}`);

  socket.on('disconnect', () => {
    console.log("🔕 Notifications socket disconnected:", socket.id);
  });
}



/**
 * @param {import('socket.io').Namespace} ns
 * @param {string} userId
 * @param {object} payload
 */
export function emitToUser(ns, userId, payload) {
  ns.to(`user:${userId}`).emit('notification', payload);
}


export function notificationHandlers(ns, socket) {
  console.log("👤 socket.user:", socket.user);

  const userId = socket.user?._id?.toString();

  if (!userId) {
    console.log("❌ Still no socket.user");
    return;
  }

  socket.join(`user:${userId}`);
  console.log("🔔 Joined room:", `user:${userId}`);
}



/**
 * @param {import('socket.io').Namespace} ns
 * @param {string} userId
 * @param {object} payload
 */
export function emitToUser(ns, userId, payload) {
  ns.to(`user:${userId}`).emit('notification', payload);
}

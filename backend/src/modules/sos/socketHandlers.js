/**
 * Live location / SOS namespace - broadcast SOS, location updates
 */

export function locationHandlers(ns, socket) {
  // Optional: join user room for targeted updates
  if (socket.user) {
    const userId = socket.user._id.toString();
    socket.join(`user:${userId}`);
  }

  // Admin / dashboard room for SOS feed
  socket.on('join:sos-dashboard', () => {
    socket.join('sos-dashboard');
  });

  socket.on('location:update', (data) => {
    // Broadcast to dashboard or relevant consumers; optional validation
    socket.broadcast.to('sos-dashboard').emit('location:update', { ...data, socketId: socket.id });
  });

  socket.on('disconnect', () => {});
}

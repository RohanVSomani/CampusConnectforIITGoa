// Live location / SOS namespace - broadcast SOS, location updates
 

export function locationHandlers(ns, socket) {
  if (socket.user) {
    const userId = socket.user._id.toString();
    socket.join(`user:${userId}`);
  }
  socket.on('join:sos-dashboard', () => {
    socket.join('sos-dashboard');
  });

  socket.on('location:update', (data) => {
    socket.broadcast.to('sos-dashboard').emit('location:update', { ...data, socketId: socket.id });
  });

  socket.on('disconnect', () => {});
}

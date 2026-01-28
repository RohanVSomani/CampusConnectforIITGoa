
export function carpoolHandlers(ns, socket) {
  if (!socket.user) return;

  socket.on('join:carpool', (carpoolId) => {
    socket.join(`carpool:${carpoolId}`);
  });

  socket.on('leave:carpool', (carpoolId) => {
    socket.leave(`carpool:${carpoolId}`);
  });

  socket.on('disconnect', () => {});
}

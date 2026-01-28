

export function orderHandlers(ns, socket) {
  socket.on('join:group', (groupId) => {
    socket.join(`group:${groupId}`);
  });

  socket.on('leave:group', (groupId) => {
    socket.leave(`group:${groupId}`);
  });

  socket.on('disconnect', () => {});
}

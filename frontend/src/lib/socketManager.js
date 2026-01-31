import { Manager } from 'socket.io-client';

let _manager = null;

export function getSocketManager(BASE, token) {
  if (!_manager) {
    _manager = new Manager(BASE, {
      path: '/socket.io',
      transports: ['websocket'],
      withCredentials: true,
    });
  }

  // 🔥 CRITICAL: update auth EVERY TIME
  _manager.opts.auth = { token };

  return _manager;
}

export function resetSocketManager() {
  if (_manager) {
    _manager.disconnect();
    _manager = null;
  }
}

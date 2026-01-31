import { useEffect, useRef, useState } from 'react';
import { io, Manager } from 'socket.io-client';

const BASE = import.meta.env.VITE_API_URL;

export function useSocket(namespace) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('campusflow_token');
    if (!token) return;

    // 1️⃣ Create manager (connects to SERVER only)
    const manager = new Manager(BASE, {
      path: '/socket.io',
      transports: ['websocket'], // Render-safe
      auth: { token },
      withCredentials: true,
    });

    // 2️⃣ Get namespace socket
    const socket = manager.socket(namespace);

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`✅ Socket connected: ${namespace}`, socket.id);
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${namespace}`);
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error(`🚨 Socket error (${namespace}):`, err.message);
    });

    return () => {
      socket.disconnect();
      manager.removeAllListeners();
    };
  }, [namespace]);

  return { socket: socketRef.current, connected };
}

/* ===== Namespace hooks ===== */

export const useCarpoolSocket = () => useSocket('/carpool');
export const useCarpoolChatSocket = () => useSocket('/carpool-chat');
export const useChatSocket = () => useSocket('/chat');
export const useNotificationsSocket = () => useSocket('/notifications');
export const useLocationSocket = () => useSocket('/location');
export const useOrdersSocket = () => useSocket('/orders');

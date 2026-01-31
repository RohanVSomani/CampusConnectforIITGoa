/**
 * Socket.IO client – React hook for namespaced connections with auth
 */

import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const BASE = import.meta.env.VITE_API_URL;

/**
 * @param {string} namespace 
 */
export function useSocket(namespace = '/', options = {}) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('campusflow_token');
    console.log("🔑 Frontend socket token:", token);
    const socket = io(`${BASE}${namespace}`, {
      auth: token ? { token } : {},
      transports: ['websocket'],
      ...options,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', namespace, socket.id);
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', namespace);
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('🚨 Socket connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [namespace]);

  return { socket: socketRef.current, connected };
}
export function useNotificationsSocket() {
  return useSocket('/notifications');
}

export function useLocationSocket() {
  return useSocket('/location');
}

export function useCarpoolSocket() {
  return useSocket('/carpool');
}

export function useOrdersSocket() {
  return useSocket('/orders');
}

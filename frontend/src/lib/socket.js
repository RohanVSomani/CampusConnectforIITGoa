import { useEffect, useRef, useState } from 'react';
import { Manager } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

const BASE = import.meta.env.VITE_API_URL;

// 🔥 SINGLE MANAGER FOR ENTIRE APP
let manager;

export function useSocket(namespace) {
  const { user, loading } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    const token = localStorage.getItem('campusflow_token');
    if (!token) return;

    // 🔥 CREATE MANAGER ONCE
    if (!manager) {
      manager = new Manager(BASE, {
        path: '/socket.io',
        transports: ['websocket'],
        withCredentials: true,
        auth: { token },
      });
    }

    // 🔥 REUSE SOCKET
    const socket = manager.socket(namespace);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`✅ Socket connected: ${namespace}`, socket.id);
      setConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log(`❌ Socket disconnected: ${namespace}`, reason);
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error(`🚨 Socket error (${namespace}):`, err.message);
    });

    return () => {
      // ❌ DO NOT disconnect on rerender
      socket.off();
    };
  }, [namespace, user, loading]);

  return { socket: socketRef.current, connected };
}

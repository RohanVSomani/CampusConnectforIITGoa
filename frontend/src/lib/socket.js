import { useEffect, useRef, useState } from 'react';
import { Manager } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

const BASE = import.meta.env.VITE_API_URL;

export function useSocket(namespace) {
  const { user, loading } = useAuth();
  const socketRef = useRef(null);
  const managerRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    const token = localStorage.getItem('campusflow_token');
    if (!token) return;

    const manager = new Manager(BASE, {
      path: '/socket.io',
      transports: ['websocket'],
      withCredentials: true,
    });

    managerRef.current = manager;

    const socket = manager.socket(namespace,{auth: { token },});
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
      socket.disconnect();
      manager.disconnect();
      managerRef.current = null;
    };
  }, [namespace, user, loading]);

  return { socket: socketRef.current, connected };
}




export const useCarpoolSocket = () => useSocket('/carpool');
export const useCarpoolChatSocket = () => useSocket('/carpool-chat');
export const useChatSocket = () => useSocket('/chat');
export const useNotificationsSocket = () => useSocket('/notifications');
export const useLocationSocket = () => useSocket('/location');
export const useOrdersSocket = () => useSocket('/orders');

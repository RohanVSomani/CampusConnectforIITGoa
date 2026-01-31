import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const BASE = import.meta.env.VITE_API_URL;

/**
 * Generic socket hook
 * @param {string} namespace
 */
export function useSocket(namespace = '/', options = {}) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('campusflow_token');

    if (!token) return;

    const socket = io(`${BASE}${namespace}`, {
      auth: { token },
      withCredentials: true,
      transports: ['polling','websocket'],
      ...options,
    });

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
      socketRef.current = null;
      setConnected(false);
    };
  }, [namespace]);

  return { socket: socketRef.current, connected };
}

/* ===== Namespace Hooks ===== */

export const useNotificationsSocket = () =>
  useSocket('/notifications');

export const useChatSocket = () =>
  useSocket('/chat');

export const useLocationSocket = () =>
  useSocket('/location');

export const useCarpoolSocket = () =>
  useSocket('/carpool');

export const useCarpoolChatSocket = () =>
  useSocket('/carpool-chat');

export const useOrdersSocket = () =>
  useSocket('/orders');

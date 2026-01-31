// import { useEffect, useRef, useState } from 'react';
// import { Manager } from 'socket.io-client';
// import { useAuth } from '@/context/AuthContext';

// const BASE = import.meta.env.VITE_API_URL;

// export function useSocket(namespace) {
//   const { user, loading } = useAuth();
//   const socketRef = useRef(null);
//   const [connected, setConnected] = useState(false);

//   useEffect(() => {
//     if (loading || !user) return;

//     const token = localStorage.getItem('campusflow_token');
//     if (!token) return;

//     // 1️⃣ connect to SERVER
//     const manager = new Manager(BASE, {
//       path: '/socket.io',
//       transports: ['websocket'], // Render-safe
//       auth: { token },
//       withCredentials: true,
//     });

//     // 2️⃣ attach namespace
//     const socket = manager.socket(namespace);
//     socketRef.current = socket;

//     socket.on('connect', () => {
//       console.log(`✅ Socket connected: ${namespace}`, socket.id);
//       setConnected(true);
//     });

//     socket.on('disconnect', () => {
//       console.log(`❌ Socket disconnected: ${namespace}`);
//       setConnected(false);
//     });

//     socket.on('connect_error', (err) => {
//       console.error(`🚨 Socket error (${namespace}):`, err.message);
//     });

//     return () => {
//       socket.disconnect();
//       manager.removeAllListeners();
//     };
//   }, [namespace, user, loading]);

//   return { socket: socketRef.current, connected };
// }

// /* ===== Namespace hooks ===== */

// export const useCarpoolSocket = () => useSocket('/carpool');
// export const useCarpoolChatSocket = () => useSocket('/carpool-chat');
// export const useChatSocket = () => useSocket('/chat');
// export const useNotificationsSocket = () => useSocket('/notifications');
// export const useLocationSocket = () => useSocket('/location');
// export const useOrdersSocket = () => useSocket('/orders');
import { Manager } from "socket.io-client";

const m = new Manager("https://campusback.onrender.com", {
  path: "/socket.io",
  transports: ["websocket"],
});

const s = m.socket("/carpool");

s.on("connect", () => {
  console.log("CONNECTED", s.id);
  s.emit("ping");
});

s.on("pong", () => {
  console.log("PONG RECEIVED");
});

s.on("connect_error", (e) => {
  console.error("CONNECT ERROR:", e.message);
});

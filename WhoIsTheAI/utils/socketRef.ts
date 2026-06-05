// utils/socketRef.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL || 'https://wita-api.ngrok.io';

export const getSocket = () => socket;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      timeout: 10000,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

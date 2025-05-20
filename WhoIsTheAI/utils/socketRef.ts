// utils/socketRef.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = () => socket;

export const initSocket = () => {
  if (!socket) {
    socket = io('https://wita-api.ngrok.io');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

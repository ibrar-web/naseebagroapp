import { io, Socket } from 'socket.io-client';
import { store } from '../../store';
import { ENV } from '../../environment';

const HEARTBEAT_INTERVAL = 25000;

let socket: Socket | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

const clearHeartbeat = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
};

const startHeartbeat = () => {
  clearHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (socket?.connected) {
      socket.emit('heartbeat');
    }
  }, HEARTBEAT_INTERVAL);
};

export const connectSocket = () => {
  if (socket?.connected) {
    return socket;
  }

  const token = store.getState().auth.token;

  socket = io(ENV.SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionAttempts: 5,
    ...(token ? { auth: { token } } : {}),
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
    startHeartbeat();
  });

  socket.on('disconnect', reason => {
    console.log('[Socket] Disconnected:', reason);
    clearHeartbeat();
  });

  socket.on('connect_error', err => {
    console.log('[Socket] Connection error:', err.message);
  });

  socket.on('heartbeat_ack', () => {
    console.log('[Socket] Heartbeat ack received');
  });

  socket.connect();
  return socket;
};

export const disconnectSocket = () => {
  clearHeartbeat();
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;

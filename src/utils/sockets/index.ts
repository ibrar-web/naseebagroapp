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

const joinUserRoomIfAuthed = () => {
  const userId = store.getState().auth.user?.id;
  if (socket && userId) {
    socket.emit('join', { userId });
    console.log('[Socket] Joined user room:', userId);
  }
};

export const connectSocket = () => {
  // Already connected — nothing to do
  if (socket?.connected) return socket;

  // Socket exists but disconnected — just reconnect it
  if (socket) {
    socket.connect();
    return socket;
  }

  const token = store.getState().auth.token;

  socket = io(ENV.SOCKET_URL, {
    autoConnect: false,
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionAttempts: 10,
    ...(token ? { auth: { token } } : {}),
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
    joinUserRoomIfAuthed();
    startHeartbeat();
  });

  socket.on('disconnect', reason => {
    console.log('[Socket] Disconnected:', reason);
    clearHeartbeat();
  });

  socket.on('connect_error', err => {
    console.log('[Socket] Connection error:', err.message);
  });

  socket.on('heartbeat_ack', () => {});

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

// ─── Auto-manage connection based on auth state ───────────────────────────────
// This runs when the module is first imported, wiring up store subscriptions
// so the socket connects/disconnects automatically as auth changes.

let trackedToken: string | null = null;

const syncSocketToAuth = () => {
  const token = store.getState().auth.token;
  if (token && token !== trackedToken) {
    trackedToken = token;
    connectSocket();
  } else if (!token && trackedToken !== null) {
    trackedToken = null;
    disconnectSocket();
  }
};

// Watch future auth changes
store.subscribe(syncSocketToAuth);

// Connect immediately if already authenticated (e.g. app restart with persisted token)
syncSocketToAuth();

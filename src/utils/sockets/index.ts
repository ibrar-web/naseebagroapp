import { io } from 'socket.io-client';
import { ENV } from '../../environment';

export const socket = io(ENV.SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

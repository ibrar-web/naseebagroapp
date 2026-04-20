import { APP_CONFIG } from '../config/appConfig';

export const SOCKET_CONFIG = {
  url: APP_CONFIG.socketUrl,
  options: {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 15000,
  },
};

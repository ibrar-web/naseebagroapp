import { ENV } from './env';

export const APP_CONFIG = {
  appName: 'Naseeb AgriTech Platform',
  apiBaseUrl: ENV.API_BASE_URL,
  socketUrl: ENV.SOCKET_URL,
  requestTimeoutMs: 20000,
};

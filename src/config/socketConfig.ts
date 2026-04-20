import { ENV } from './env';

export const SOCKET_RUNTIME_CONFIG = {
  url: ENV.SOCKET_URL,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
};

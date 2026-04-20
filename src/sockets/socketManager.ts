import { io, Socket } from 'socket.io-client';
import { SOCKET_CONFIG } from './socketConfig';

class SocketManager {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return this.socket;

    this.socket = io(SOCKET_CONFIG.url, {
      ...SOCKET_CONFIG.options,
      auth: { token },
    });

    this.socket.on('connect_error', (error) => {
      console.warn('Socket connect_error:', error.message);
    });

    return this.socket;
  }

  on(event: string, handler: (...args: any[]) => void) {
    this.socket?.on(event, handler);
  }

  emit(event: string, payload?: unknown) {
    this.socket?.emit(event, payload);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketManager = new SocketManager();

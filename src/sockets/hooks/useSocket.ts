import { useEffect } from 'react';
import { socketManager } from '../socketManager';

export const useSocket = (token?: string) => {
  useEffect(() => {
    if (!token) return;
    socketManager.connect(token);

    return () => {
      socketManager.disconnect();
    };
  }, [token]);
};

import { useEffect } from 'react';
import { socketManager } from '../socketManager';
import { DEAL_EVENTS } from '../eventHandlers/deals.events';

export const useDealLiveUpdates = (onUpdate: (payload: unknown) => void) => {
  useEffect(() => {
    socketManager.on(DEAL_EVENTS.DEAL_UPDATED, onUpdate);
  }, [onUpdate]);
};

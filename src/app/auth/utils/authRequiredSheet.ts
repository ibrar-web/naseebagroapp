export type AuthSheetPayload = { redirectToMarket?: boolean };
type AuthRequiredListener = (payload: AuthSheetPayload) => void;

const listeners = new Set<AuthRequiredListener>();
let pendingAuthPrompt: AuthSheetPayload | null = null;

export const subscribeAuthRequiredSheet = (
  listener: AuthRequiredListener,
) => {
  listeners.add(listener);

  if (pendingAuthPrompt) {
    const payload = pendingAuthPrompt;
    pendingAuthPrompt = null;
    listener(payload);
  }

  return () => {
    listeners.delete(listener);
  };
};

export const showAuthRequiredSheet = (payload: AuthSheetPayload = {}) => {
  if (!listeners.size) {
    pendingAuthPrompt = payload;
    return false;
  }

  listeners.forEach(listener => listener(payload));
  return true;
};

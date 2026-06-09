type AuthRequiredListener = () => void;

const listeners = new Set<AuthRequiredListener>();
let pendingAuthPrompt = false;

export const subscribeAuthRequiredSheet = (
  listener: AuthRequiredListener,
) => {
  listeners.add(listener);

  if (pendingAuthPrompt) {
    pendingAuthPrompt = false;
    listener();
  }

  return () => {
    listeners.delete(listener);
  };
};

export const showAuthRequiredSheet = () => {
  if (!listeners.size) {
    pendingAuthPrompt = true;
    return false;
  }

  listeners.forEach(listener => listener());
  return true;
};

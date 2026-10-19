// What the user did just before a crash: screens visited and API calls made.

export type Breadcrumb = {
  type: 'screen' | 'api';
  message: string;
  at: string;
};

const MAX_BREADCRUMBS = 15;
const trail: Breadcrumb[] = [];
let currentScreen: string | null = null;

export const addBreadcrumb = (type: Breadcrumb['type'], message: string) => {
  trail.push({ type, message, at: new Date().toISOString() });
  if (trail.length > MAX_BREADCRUMBS) {
    trail.shift();
  }
};

export const setCurrentScreen = (name: string | undefined) => {
  if (!name || name === currentScreen) {
    return;
  }
  currentScreen = name;
  addBreadcrumb('screen', name);
};

export const getCurrentScreen = () => currentScreen;

export const getBreadcrumbs = (): Breadcrumb[] => [...trail];

import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { ENV } from '../../environment';
import { getBreadcrumbs, getCurrentScreen } from './breadcrumbs';
import type { CrashReport, CrashSource } from './crashReport.types';
import { SCREEN_MODULES } from './screenModules';

const MAX_STACK_LENGTH = 8000;
const SEND_TIMEOUT_MS = 5000;
// Reports are not stored on the phone, so give a fatal report time to reach
// the server before the app closes.
const FATAL_SEND_GRACE_MS = 3000;

let getToken: () => string | null = () => null;
// Same error reported once per session; the server counts repeats anyway.
const reportedThisSession = new Set<string>();

const newReportId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

// First named function in a JS stack ("at renderOffer (...)").
const topFunction = (stack: string | undefined): string | null => {
  for (const line of (stack ?? '').split('\n')) {
    const name = /^\s*at\s+([\w$.]+)\s*\(/.exec(line)?.[1];
    if (name && !name.startsWith('?anon')) {
      return name;
    }
  }
  return null;
};

// Innermost component in a React component stack ("in OfferCard" / "at OfferCard").
const topComponent = (componentStack: string | null): string | null =>
  /(?:in|at)\s+([A-Z][\w$]*)/.exec(componentStack ?? '')?.[1] ?? null;

// Module from the screen map; dev stacks also contain src/app/<module>/ paths.
const locate = (screen: string | null, stack: string | undefined) => {
  const mapped = screen ? SCREEN_MODULES[screen] : undefined;
  if (mapped) {
    return mapped;
  }
  const fromStack = /src\/app\/(\w+)\//.exec(stack ?? '')?.[1];
  return { module: fromStack ?? null, file: null };
};

const toError = (value: unknown): Error =>
  value instanceof Error ? value : new Error(String(value));

const buildReport = (
  error: Error,
  source: CrashSource,
  isFatal: boolean,
  componentStack: string | null,
): CrashReport => {
  const screen = getCurrentScreen();
  const where = locate(screen, error.stack);
  return {
    client_report_id: newReportId(),
    error_name: error.name || 'Error',
    message: (error.message || String(error)).slice(0, 1000),
    stack: error.stack ? error.stack.slice(0, MAX_STACK_LENGTH) : null,
    component_stack: componentStack?.slice(0, MAX_STACK_LENGTH) ?? null,
    is_fatal: isFatal,
    source,
    screen,
    module: where.module,
    screen_file: where.file,
    component: topComponent(componentStack),
    function_name: topFunction(error.stack),
    breadcrumbs: getBreadcrumbs(),
    app_version: DeviceInfo.getVersion(),
    build_number: DeviceInfo.getBuildNumber(),
    platform: Platform.OS,
    os_version: String(Platform.Version),
    device_model: `${DeviceInfo.getBrand()} ${DeviceInfo.getModel()}`,
    app_env: ENV.APP_ENV,
    occurred_at: new Date().toISOString(),
  };
};

// Plain fetch, not HttpService: a failed report must never show an alert,
// log the user out or report itself.
const send = async (report: CrashReport): Promise<boolean> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
  try {
    const token = getToken();
    const res = await fetch(`${ENV.API_BASE_URL}/app/crash-reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(report),
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
};

export const reportCrash = (
  value: unknown,
  source: CrashSource,
  isFatal: boolean,
  componentStack: string | null = null,
): Promise<void> => {
  try {
    const error = toError(value);
    const key = `${error.name}:${error.message}:${source}`;
    if (reportedThisSession.has(key)) {
      return Promise.resolve();
    }
    reportedThisSession.add(key);

    const report = buildReport(error, source, isFatal, componentStack);
    return send(report).then(() => undefined);
  } catch {
    return Promise.resolve();
  }
};

let installed = false;

/** Call once, as early as possible (index.js). */
export const installCrashReporter = (options: {
  getToken: () => string | null;
}) => {
  getToken = options.getToken;
  if (installed) {
    return;
  }
  installed = true;

  const previousHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
    const pending = reportCrash(error, 'global', Boolean(isFatal));
    if (!isFatal) {
      previousHandler(error, isFatal);
      return;
    }
    // The default fatal handler closes the app; let the report go out first.
    const grace = new Promise<void>(resolve =>
      setTimeout(() => resolve(), FATAL_SEND_GRACE_MS),
    );
    Promise.race([pending, grace]).finally(() =>
      previousHandler(error, isFatal),
    );
  });

  // React Native tracks unhandled rejections only in dev (for LogBox).
  if (!__DEV__) {
    (globalThis as any).HermesInternal?.enablePromiseRejectionTracker?.({
      allRejections: true,
      onUnhandled: (_id: number, rejection: unknown) => {
        reportCrash(rejection, 'promise', false);
      },
    });
  }
};

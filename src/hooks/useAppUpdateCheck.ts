import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, NativeModules, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export type AppUpdateInfo = {
  /** Store version name (iOS only; Google Play exposes just a build number). */
  latest_version: string | null;
  release_notes: string | null;
  store_url: string;
  force_update: boolean;
};

const BUNDLE_ID = DeviceInfo.getBundleId();
// App Store storefront the app is published in; the lookup returns nothing for other countries.
const IOS_STORE_COUNTRY = 'pk';
// Google Play update priority (0-5, set per release when publishing) at which the update is required.
const ANDROID_FORCE_PRIORITY = 4;
// Re-check on foreground at most this often.
const MIN_RECHECK_MS = 30 * 60 * 1000;

const PLAY_URL = `https://play.google.com/store/apps/details?id=${BUNDLE_ID}`;
const { StoreUpdate } = NativeModules;

/** Compares dotted versions numerically: "1.10.0" > "1.9.3". */
const isNewer = (store: string, installed: string) => {
  const a = store.split('.').map(Number);
  const b = installed.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff > 0;
  }
  return false;
};

/** App Store: Apple's public lookup API returns the live version for a bundle id. */
async function checkAppStore(): Promise<AppUpdateInfo | null> {
  const res = await fetch(
    `https://itunes.apple.com/lookup?bundleId=${BUNDLE_ID}&country=${IOS_STORE_COUNTRY}&_=${Date.now()}`,
  );
  const app = (await res.json())?.results?.[0];
  if (!app?.version || !isNewer(app.version, DeviceInfo.getVersion())) return null;
  return {
    latest_version: app.version,
    release_notes: app.releaseNotes ?? null,
    store_url: String(app.trackViewUrl).replace(/^https:/, 'itms-apps:'),
    force_update: false,
  };
}

/** Google Play: the Play In-App Updates library (StoreUpdateModule.kt). */
async function checkPlayStore(): Promise<AppUpdateInfo | null> {
  if (!StoreUpdate) return null;
  const res = await StoreUpdate.check();
  if (!res.available && !res.inProgress) return null;
  return {
    latest_version: null,
    release_notes: null,
    store_url: `market://details?id=${BUNDLE_ID}`,
    force_update: res.inProgress || res.priority >= ANDROID_FORCE_PRIORITY,
  };
}

/**
 * Checks the App Store / Google Play for a newer version on launch and when the app returns to
 * the foreground. A normal update can be dismissed until the next store version; a required one
 * (Android priority >= 4) cannot. Debug and sideloaded builds never prompt.
 */
export const useAppUpdateCheck = () => {
  const [info, setInfo] = useState<AppUpdateInfo | null>(null);
  const dismissed = useRef<string | null>(null);
  const lastCheck = useRef(0);

  const check = useCallback(async () => {
    lastCheck.current = Date.now();
    try {
      const update = Platform.OS === 'ios' ? await checkAppStore() : await checkPlayStore();
      const key = update ? update.latest_version ?? 'play' : null;
      if (update && !update.force_update && dismissed.current === key) return;
      setInfo(update);
    } catch {
      // Never block the app because the store could not be reached.
    }
  }, []);

  useEffect(() => {
    check();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active' && Date.now() - lastCheck.current > MIN_RECHECK_MS) check();
    });
    return () => sub.remove();
  }, [check]);

  const openStore = useCallback(async () => {
    if (!info) return;
    // On Android, Google's own update screen downloads and installs without leaving the app.
    if (Platform.OS === 'android' && StoreUpdate) {
      try {
        if (await StoreUpdate.startUpdate()) return;
      } catch {}
    }
    try {
      await Linking.openURL(info.store_url);
    } catch {
      Linking.openURL(Platform.OS === 'android' ? PLAY_URL : info.store_url.replace(/^itms-apps:/, 'https:'));
    }
  }, [info]);

  const dismiss = useCallback(() => {
    if (!info || info.force_update) return;
    dismissed.current = info.latest_version ?? 'play';
    setInfo(null);
  }, [info]);

  return { info, openStore, dismiss };
};

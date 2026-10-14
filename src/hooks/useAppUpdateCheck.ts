import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { api } from '../utils/api';

export type AppUpdateInfo = {
  latest_version: string;
  min_version: string;
  store_url: string | null;
  release_notes: string | null;
  update_available: boolean;
  force_update: boolean;
};

const ANDROID_STORE_URL = `market://details?id=${DeviceInfo.getBundleId()}`;
// Re-check on foreground at most this often, so switching apps doesn't spam the API.
const MIN_RECHECK_MS = 30 * 60 * 1000;

/**
 * Asks the backend whether this build is outdated, on launch and when the app returns
 * to the foreground. A soft update can be dismissed once per latest_version; a forced
 * update cannot be dismissed.
 */
export const useAppUpdateCheck = () => {
  const [info, setInfo] = useState<AppUpdateInfo | null>(null);
  const dismissedVersion = useRef<string | null>(null);
  const lastCheck = useRef(0);

  const check = useCallback(async () => {
    lastCheck.current = Date.now();
    try {
      const res: any = await api.app.checkVersion({
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
        version: DeviceInfo.getVersion(),
      });
      const hasStore = !!res?.store_url || Platform.OS === 'android';
      if ((!res?.update_available && !res?.force_update) || !hasStore) {
        setInfo(null);
        return;
      }
      if (!res.force_update && dismissedVersion.current === res.latest_version) return;
      setInfo(res);
    } catch {
      // Never block the app because the version check failed.
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
    const url = info?.store_url || (Platform.OS === 'android' ? ANDROID_STORE_URL : null);
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch {
      if (Platform.OS === 'android') {
        Linking.openURL(`https://play.google.com/store/apps/details?id=${DeviceInfo.getBundleId()}`);
      }
    }
  }, [info]);

  const dismiss = useCallback(() => {
    if (info?.force_update) return;
    dismissedVersion.current = info?.latest_version ?? null;
    setInfo(null);
  }, [info]);

  return { info, openStore, dismiss };
};

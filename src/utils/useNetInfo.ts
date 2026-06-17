import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetInfoResult {
  isConnected: boolean;
  isInternetReachable: boolean;
}

export function useNetInfo(): NetInfoResult {
  const [state, setState] = useState<NetInfoResult>({
    isConnected: true,
    isInternetReachable: true,
  });
  const prevConnected = useRef<boolean | null>(null);

  useEffect(() => {
    NetInfo.fetch().then((s: NetInfoState) => {
      const connected = s.isConnected ?? true;
      const reachable = s.isInternetReachable ?? true;
      setState({ isConnected: connected, isInternetReachable: reachable });
      prevConnected.current = connected;
    });

    const unsubscribe = NetInfo.addEventListener((s: NetInfoState) => {
      const connected = s.isConnected ?? true;
      const reachable = s.isInternetReachable ?? true;

      // Show alert only when transitioning from connected → disconnected
      if (prevConnected.current === true && !connected) {
        Alert.alert(
          'No Internet Connection',
          'You are offline. Some features may not be available.',
          [{ text: 'OK' }],
        );
      }

      prevConnected.current = connected;
      setState({ isConnected: connected, isInternetReachable: reachable });
    });

    return unsubscribe;
  }, []);

  return state;
}

/**
 * Call before any user-triggered API action (submit, send offer, etc.).
 * Shows an alert and returns false if offline.
 */
export async function checkInternet(): Promise<boolean> {
  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    Alert.alert(
      'No Internet Connection',
      'Please check your internet connection and try again.',
      [{ text: 'OK' }],
    );
    return false;
  }
  return true;
}

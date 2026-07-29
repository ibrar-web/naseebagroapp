import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppSelector } from '../../../store';
import api from '../../../utils/api';
import { navigationRef } from '../../../navigation/AppNavigator';

const STORAGE_KEY = 'naseeb_review_prompted_deals';

async function getPromptedIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function markPrompted(dealId: string): Promise<void> {
  try {
    const ids = await getPromptedIds();
    if (!ids.includes(dealId)) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, dealId]));
    }
  } catch {}
}

export function useReviewPrompt() {
  const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated);
  const mode = useAppSelector(s => s.app.mode);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || hasChecked.current) return;
    hasChecked.current = true;

    const check = async () => {
      try {
        // Small delay so navigation is ready before we might navigate
        await new Promise(r => setTimeout(r, 1500));

        const res = (
          mode === 'buyer'
            ? await api.buyer.listDeals()
            : await api.seller.listDeals()
        ) as { data?: Array<{ id: string; code?: string | null; status: string }> } | undefined;

        const closedDeals = (res?.data ?? []).filter(d => d.status === 'closed');
        if (closedDeals.length === 0) return;

        const prompted = await getPromptedIds();
        const pending = closedDeals.find(d => !prompted.includes(d.id));
        if (!pending) return;

        const dealCode = pending.code ?? pending.id.slice(0, 8);

        Alert.alert(
          'Rate Your Experience',
          `How was your experience with deal ${dealCode}? Your feedback helps us improve.`,
          [
            {
              text: 'Not Now',
              style: 'cancel',
              onPress: () => void markPrompted(pending.id),
            },
            {
              text: 'Rate Now',
              onPress: async () => {
                await markPrompted(pending.id);
                if (navigationRef.isReady()) {
                  navigationRef.navigate('DealDetail', { dealId: pending.id });
                }
              },
            },
          ],
          { cancelable: false },
        );
      } catch {
        // silently fail — never block the user
      }
    };

    void check();
  }, [isAuthenticated, mode]);
}

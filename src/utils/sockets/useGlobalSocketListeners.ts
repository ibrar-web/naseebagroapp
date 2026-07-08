import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';
import { navigationRef } from '../../navigation/AppNavigator';
import { onPostApproved, onPostRejected, onPostNeedsRevision } from './posts';
import {
  onDealCreated,
  onTruckDocApproved,
  onTruckDocRejected,
  onBuyerDocApproved,
  onBuyerDocRejected,
  onPaymentApproved,
} from './deals';

const navigate = (screen: string, params?: object) => {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(screen, params);
  }
};

export const useGlobalSocketListeners = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  // ── Post status events ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubApproved = onPostApproved((data) => {
      Alert.alert(
        'Post Approved',
        `Your post ${data.code} has been approved and is now live.`,
        [
          { text: 'View', onPress: () => navigate('PostDetail', { postId: data.id }) },
          { text: 'OK', style: 'cancel' },
        ],
      );
    });

    const unsubRejected = onPostRejected((data) => {
      Alert.alert(
        'Post Rejected',
        `Your post ${data.code} was rejected.\n\nReason: ${data.reason}`,
        [
          { text: 'View', onPress: () => navigate('PostDetail', { postId: data.id }) },
          { text: 'OK', style: 'cancel' },
        ],
      );
    });

    const unsubRevision = onPostNeedsRevision((data) => {
      Alert.alert(
        'Post Needs Revision',
        `Your post ${data.code} needs changes.\n\n${data.notes}`,
        [
          { text: 'View', onPress: () => navigate('PostDetail', { postId: data.id }) },
          { text: 'OK', style: 'cancel' },
        ],
      );
    });

    return () => {
      unsubApproved();
      unsubRejected();
      unsubRevision();
    };
  }, [isAuthenticated]);

  // ── Deal events ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubDealCreated = onDealCreated((data) => {
      Alert.alert(
        'Deal Created',
        `Deal ${data.code} has been created.`,
        [
          { text: 'View Deal', onPress: () => navigate('DealDetail', { dealId: data.deal_id }) },
          { text: 'Later', style: 'cancel' },
        ],
      );
    });

    const unsubTruckApproved = onTruckDocApproved((data) => {
      Alert.alert(
        'Document Approved',
        'Your truck document has been approved.',
        [
          { text: 'View Deal', onPress: () => navigate('DealDetail', { dealId: data.deal_id }) },
          { text: 'OK', style: 'cancel' },
        ],
      );
    });

    const unsubTruckRejected = onTruckDocRejected((data) => {
      Alert.alert(
        'Document Rejected',
        'Your truck document was rejected. Please re-upload.',
        [
          { text: 'View Deal', onPress: () => navigate('DealDetail', { dealId: data.deal_id }) },
          { text: 'OK', style: 'cancel' },
        ],
      );
    });

    const unsubBuyerApproved = onBuyerDocApproved((data) => {
      Alert.alert(
        'Document Approved',
        'Your pohnch/bilty document has been approved.',
        [
          { text: 'View Deal', onPress: () => navigate('DealDetail', { dealId: data.deal_id }) },
          { text: 'OK', style: 'cancel' },
        ],
      );
    });

    const unsubBuyerRejected = onBuyerDocRejected((data) => {
      Alert.alert(
        'Document Rejected',
        'Your pohnch/bilty document was rejected. Please re-upload.',
        [
          { text: 'View Deal', onPress: () => navigate('DealDetail', { dealId: data.deal_id }) },
          { text: 'OK', style: 'cancel' },
        ],
      );
    });

    const unsubPayment = onPaymentApproved((data) => {
      Alert.alert(
        'Payment Approved',
        `A payment of ${data.amount} has been approved on your deal.`,
        [
          { text: 'View Deal', onPress: () => navigate('DealDetail', { dealId: data.deal_id }) },
          { text: 'OK', style: 'cancel' },
        ],
      );
    });

    return () => {
      unsubDealCreated();
      unsubTruckApproved();
      unsubTruckRejected();
      unsubBuyerApproved();
      unsubBuyerRejected();
      unsubPayment();
    };
  }, [isAuthenticated]);
};

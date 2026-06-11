import { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { navigationRef } from '../../navigation/AppNavigator';
import {
  CounterOfferPayload,
  NewOfferPayload,
  onCounterOffer,
  onNewOffer,
  onOfferAccepted,
  onOfferRejected,
  OfferStatusPayload,
} from '../../utils/sockets/negotiations';

const isOnNegotiationScreen = (offerId: string) => {
  if (!navigationRef.isReady()) return false;
  const route = navigationRef.getCurrentRoute();
  return route?.name === 'Negotiation' && (route.params as any)?.offerId === offerId;
};

export const showOfferToast = (offerId: string, title: string, body?: string) => {
  if (isOnNegotiationScreen(offerId)) return;
  Toast.show({
    type: 'offer',
    text1: title,
    text2: body,
    visibilityTime: 5000,
    props: { offerId },
  });
};

const OfferAlertToast = () => {
  useEffect(() => {
    const unsubNew = onNewOffer((data: NewOfferPayload) => {
      showOfferToast(data.offer_id, 'New Offer Received', `Offer ${data.code ?? ''}`);
    });

    const unsubCounter = onCounterOffer((data: CounterOfferPayload) => {
      showOfferToast(
        data.offer_id,
        'Counter Offer Received',
        `Round ${data.round} — PKR ${Number(data.offered_price).toLocaleString('en-PK')}`,
      );
    });

    const unsubAccepted = onOfferAccepted((data: OfferStatusPayload) => {
      showOfferToast(data.offer_id, '✅ Offer Accepted', 'A deal has been created');
    });

    const unsubRejected = onOfferRejected((data: OfferStatusPayload) => {
      showOfferToast(data.offer_id, 'Offer Rejected');
    });

    return () => {
      unsubNew();
      unsubCounter();
      unsubAccepted();
      unsubRejected();
    };
  }, []);

  return null;
};

export default OfferAlertToast;

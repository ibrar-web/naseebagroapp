import { useEffect, useRef } from 'react';
import Toast from 'react-native-toast-message';
import { navigationRef } from '../../navigation/AppNavigator';
import { useAppSelector } from '../../store';
import { getSocket, connectSocket } from '../../utils/sockets';
import {
  CounterOfferPayload,
  NewOfferPayload,
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

// Attach offer event listeners directly to the socket instance.
// Returns a cleanup function that removes them.
const attachListeners = () => {
  const socket = getSocket();
  if (!socket) return () => {};

  const onNew = (data: NewOfferPayload) => {
    showOfferToast(data.offer_id, 'New Offer Received', `Offer ${data.code ?? ''}`);
  };
  const onCounter = (data: CounterOfferPayload) => {
    showOfferToast(
      data.offer_id,
      'Counter Offer Received',
      `Round ${data.round} — PKR ${Number(data.offered_price).toLocaleString('en-PK')}`,
    );
  };
  const onAccepted = (data: OfferStatusPayload) => {
    showOfferToast(data.offer_id, 'Offer Accepted', 'A deal has been created');
  };
  const onRejected = (data: OfferStatusPayload) => {
    showOfferToast(data.offer_id, 'Offer Rejected');
  };

  socket.on('offer.created', onNew);
  socket.on('offer.countered', onCounter);
  socket.on('offer.accepted', onAccepted);
  socket.on('offer.rejected', onRejected);

  return () => {
    socket.off('offer.created', onNew);
    socket.off('offer.countered', onCounter);
    socket.off('offer.accepted', onAccepted);
    socket.off('offer.rejected', onRejected);
  };
};

const OfferAlertToast = () => {
  const token = useAppSelector(s => s.auth.token);
  const cleanupRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!token) return;

    // Ensure socket exists (no-op if already connected)
    connectSocket();

    const socket = getSocket();
    if (!socket) return;

    // Clean up any previous listeners before re-attaching
    cleanupRef.current();
    cleanupRef.current = attachListeners();

    // Re-attach on every reconnect (handles network drops)
    const handleReconnect = () => {
      cleanupRef.current();
      cleanupRef.current = attachListeners();
    };
    socket.on('connect', handleReconnect);

    return () => {
      socket.off('connect', handleReconnect);
      cleanupRef.current();
      cleanupRef.current = () => {};
    };
  }, [token]);

  return null;
};

export default OfferAlertToast;

import { useEffect, useRef } from 'react';
import { showOfferToast } from './toastConfig';
import { useAppSelector } from '../../store';
import { getSocket, connectSocket } from '../../utils/sockets';
import {
  CounterOfferPayload,
  NewOfferPayload,
  OfferStatusPayload,
} from '../../utils/sockets/negotiations';

const attachListeners = (currentUserId: string | undefined) => {
  const socket = getSocket();
  if (!socket) return () => {};

  const onNew = (data: NewOfferPayload) => {
    if (data.sent_by && data.sent_by === currentUserId) return;
    showOfferToast(data.offer_id, 'New Offer Received', `Offer ${data.code ?? ''}`);
  };
  const onCounter = (data: CounterOfferPayload) => {
    if (data.sent_by && data.sent_by === currentUserId) return;
    showOfferToast(
      data.offer_id,
      'Counter Offer',
      `Round ${data.round} — PKR ${Number(data.offered_price).toLocaleString('en-PK')}`,
    );
  };
  const onAccepted = (data: OfferStatusPayload) => {
    showOfferToast(data.offer_id, 'Offer Accepted ✓', 'A deal has been created');
  };
  const onRejected = (data: OfferStatusPayload) => {
    showOfferToast(data.offer_id, 'Offer Rejected', 'The offer was declined');
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
  const currentUserId = useAppSelector(s => s.auth.user?.id);
  const cleanupRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!token) return;
    connectSocket();
    const socket = getSocket();
    if (!socket) return;

    cleanupRef.current();
    cleanupRef.current = attachListeners(currentUserId);

    const handleReconnect = () => {
      cleanupRef.current();
      cleanupRef.current = attachListeners(currentUserId);
    };
    socket.on('connect', handleReconnect);

    return () => {
      socket.off('connect', handleReconnect);
      cleanupRef.current();
      cleanupRef.current = () => {};
    };
  }, [token, currentUserId]);

  return null;
};

export default OfferAlertToast;

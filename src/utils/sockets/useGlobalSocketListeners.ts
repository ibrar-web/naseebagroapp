import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';
import { showPostToast, showDealToast } from '../../app/components/toastConfig';
import { onPostApproved, onPostRejected, onPostNeedsRevision } from './posts';
import {
  onDealCreated,
  onTruckDocApproved,
  onTruckDocRejected,
  onBuyerDocApproved,
  onBuyerDocRejected,
  onPaymentApproved,
} from './deals';

export const useGlobalSocketListeners = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  // ── Post status events ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubApproved = onPostApproved((data) => {
      showPostToast(
        'Post Approved',
        `Your ${data.post_type} post ${data.code} is now live.`,
        data.id,
        data.post_type,
        'success',
      );
    });

    const unsubRejected = onPostRejected((data) => {
      showPostToast(
        'Post Rejected',
        `${data.code} — ${data.reason}`,
        data.id,
        data.post_type,
        'error',
      );
    });

    const unsubRevision = onPostNeedsRevision((data) => {
      showPostToast(
        'Post Needs Revision',
        `${data.code} — ${data.notes}`,
        data.id,
        data.post_type,
        'warning',
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
      showDealToast('Deal Created', `Deal ${data.code} is ready.`, data.deal_id);
    });

    const unsubTruckApproved = onTruckDocApproved((data) => {
      showDealToast('Truck Doc Approved', 'Your truck document has been approved.', data.deal_id);
    });

    const unsubTruckRejected = onTruckDocRejected((data) => {
      showDealToast('Truck Doc Rejected', 'Please re-upload your truck document.', data.deal_id);
    });

    const unsubBuyerApproved = onBuyerDocApproved((data) => {
      showDealToast('Document Approved', 'Your pohnch/bilty has been approved.', data.deal_id);
    });

    const unsubBuyerRejected = onBuyerDocRejected((data) => {
      showDealToast('Document Rejected', 'Please re-upload your pohnch/bilty.', data.deal_id);
    });

    const unsubPayment = onPaymentApproved((data) => {
      showDealToast('Payment Approved', `PKR ${data.amount} payment has been approved.`, data.deal_id);
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

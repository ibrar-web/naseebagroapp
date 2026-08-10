import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';
import { showPostToast, showDealToast, showProfileToast, showDisputeToast, showQueryToast, showOfferToast } from '../../app/components/toastConfig';
import { onPostApproved, onPostRejected, onPostNeedsRevision } from './posts';
import { onAdminReview, onOfferAdminFinalized } from './negotiations';
import {
  onDealCompleted,
  onDealCreated,
  onTruckDocApproved,
  onTruckDocRejected,
  onBuyerDocApproved,
  onBuyerDocRejected,
  onPaymentApproved,
  onPaymentVerified,
  onPaymentRejected,
  onPaymentSent,
} from './deals';
import { onKycUpdated, onBusinessUpdated, onBankUpdated, onBasicUpdated } from './profile';
import { onDisputeUnderReview, onDisputeResolved } from './disputes';
import { onQueryAdminReply, onQueryClosed } from './queries';
import { navigationRef } from '../../navigation/AppNavigator';

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
      showDealToast('Deal Created', `Deal ${data.code} is ready.`, data.deal_id, data.mode);
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

    const unsubPaymentVerified = onPaymentVerified((data) => {
      showDealToast('Payment Verified', 'Your payment has been verified by admin.', data.deal_id, 'buyer');
    });

    const unsubPaymentRejected = onPaymentRejected((data) => {
      showDealToast(
        'Payment Rejected',
        data.reason ? `Payment rejected: ${data.reason}` : 'Your payment has been rejected.',
        data.deal_id,
        'buyer',
      );
    });

    const unsubPaymentSent = onPaymentSent((data) => {
      showDealToast('Payout Received', 'A payout has been sent to you for this deal.', data.deal_id, 'seller');
    });

    const unsubCompleted = onDealCompleted((data) => {
      showDealToast('Deal Completed', `Deal ${data.code} has been completed successfully.`, data.deal_id);
    });

    return () => {
      unsubDealCreated();
      unsubTruckApproved();
      unsubTruckRejected();
      unsubBuyerApproved();
      unsubBuyerRejected();
      unsubPayment();
      unsubPaymentVerified();
      unsubPaymentRejected();
      unsubPaymentSent();
      unsubCompleted();
    };
  }, [isAuthenticated]);

  // ── Dispute status events ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubUnderReview = onDisputeUnderReview((data) => {
      showDisputeToast(
        'Dispute Under Review',
        `${data.code || 'Your dispute'} is now being reviewed.`,
        data.dispute_id,
      );
    });

    const unsubResolved = onDisputeResolved((data) => {
      showDisputeToast(
        'Dispute Resolved',
        `${data.code || 'Your dispute'} has been resolved.`,
        data.dispute_id,
      );
    });

    return () => {
      unsubUnderReview();
      unsubResolved();
    };
  }, [isAuthenticated]);

  // ── User query events ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubReply = onQueryAdminReply((data) => {
      showQueryToast(
        'Admin Replied',
        data.message?.content || `Reply on ${data.subject || 'your query'}`,
        'info',
      );
    });

    const unsubClosed = onQueryClosed(() => {
      showQueryToast('Query Closed', 'Your support query has been closed.', 'success');
    });

    return () => {
      unsubReply();
      unsubClosed();
    };
  }, [isAuthenticated]);

  // ── Profile approval events ────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const goToProfile = () => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('MainTabs', { screen: 'Profile' });
      }
    };

    const unsubKyc = onKycUpdated((data) => {
      const approved = data.kyc_status === 'approved';
      showProfileToast(
        approved ? 'KYC Approved' : 'KYC Rejected',
        approved
          ? 'Your identity verification has been approved.'
          : `KYC rejected${data.reason ? ': ' + data.reason : '.'}`,
        approved ? 'approved' : 'rejected',
        goToProfile,
      );
    });

    const unsubBusiness = onBusinessUpdated((data) => {
      const approved = data.status === 'approved';
      showProfileToast(
        approved ? 'Business Profile Approved' : 'Business Profile Rejected',
        approved
          ? 'Your business profile has been verified and approved.'
          : `Business profile rejected${data.reason ? ': ' + data.reason : '.'}`,
        approved ? 'approved' : 'rejected',
        goToProfile,
      );
    });

    const unsubBank = onBankUpdated((data) => {
      const approved = data.status === 'approved';
      showProfileToast(
        approved ? 'Bank Account Approved' : 'Bank Account Rejected',
        approved
          ? 'Your bank account has been verified and approved.'
          : `Bank account rejected${data.reason ? ': ' + data.reason : '.'}`,
        approved ? 'approved' : 'rejected',
        goToProfile,
      );
    });

    const unsubBasic = onBasicUpdated((data) => {
      const approved = data.status === 'approved';
      showProfileToast(
        approved ? 'Profile Approved' : 'Profile Rejected',
        approved
          ? 'Your basic profile has been approved.'
          : `Profile rejected${data.reason ? ': ' + data.reason : '.'}`,
        approved ? 'approved' : 'rejected',
        goToProfile,
      );
    });

    return () => {
      unsubKyc();
      unsubBusiness();
      unsubBank();
      unsubBasic();
    };
  }, [isAuthenticated]);

  // ── Admin offer events ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubAdminReview = onAdminReview((data) => {
      showOfferToast(data.offer_id, data.title || 'Admin Notification', data.body);
    });

    const unsubFinalized = onOfferAdminFinalized((data) => {
      if (data.deal_id) {
        showDealToast('Deal Created by Admin', 'Admin has finalized the offer and created a deal. Tap to view.', data.deal_id, data.mode);
      } else {
        showOfferToast(data.offer_id, 'Deal Finalized by Admin', 'Admin has finalized the offer and created a deal.');
      }
    });

    return () => {
      unsubAdminReview();
      unsubFinalized();
    };
  }, [isAuthenticated]);
};

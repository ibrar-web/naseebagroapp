import { getSocket } from './index';

export interface DisputeStatusPayload {
  dispute_id: string;
  code: string | null;
  status: string;
}

export const onDisputeUnderReview = (
  cb: (payload: DisputeStatusPayload) => void,
): (() => void) => {
  const socket = getSocket();
  if (!socket) return () => {};
  socket.on('dispute.under_review', cb);
  return () => socket.off('dispute.under_review', cb);
};

export const onDisputeResolved = (
  cb: (payload: DisputeStatusPayload) => void,
): (() => void) => {
  const socket = getSocket();
  if (!socket) return () => {};
  socket.on('dispute.resolved', cb);
  return () => socket.off('dispute.resolved', cb);
};

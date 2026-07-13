import { getSocket } from './index';

export interface QueryAdminReplyPayload {
  query_id: string;
  code: string | null;
  subject: string;
  message: {
    id: string;
    content: string;
    sender_role: 'admin';
    created_at: string;
  };
}

export interface QueryClosedPayload {
  query_id: string;
  code: string | null;
}

export const onQueryAdminReply = (
  cb: (payload: QueryAdminReplyPayload) => void,
): (() => void) => {
  const socket = getSocket();
  if (!socket) return () => {};
  socket.on('query.admin_reply', cb);
  return () => socket.off('query.admin_reply', cb);
};

export const onQueryClosed = (
  cb: (payload: QueryClosedPayload) => void,
): (() => void) => {
  const socket = getSocket();
  if (!socket) return () => {};
  socket.on('query.closed', cb);
  return () => socket.off('query.closed', cb);
};

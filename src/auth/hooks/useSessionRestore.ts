import { useEffect } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { restoreSessionComplete, loginSuccess } from '../../store/slices/authSlice';
import { getSession } from '../services/sessionService';

export const useSessionRestore = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const hydrate = async () => {
      const session = await getSession();
      if (session?.accessToken) {
        dispatch(
          loginSuccess({
            user: { id: 'restored', name: 'Restored User', role: 'buyer' },
            tokens: session,
          }),
        );
      }
      dispatch(restoreSessionComplete());
    };

    hydrate();
  }, [dispatch]);
};

import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './rootReducer';
import { authMiddleware } from './middleware/authMiddleware';
import { socketMiddleware } from './middleware/socketMiddleware';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(authMiddleware, socketMiddleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

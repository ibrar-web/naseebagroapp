import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import marketplaceReducer from './slices/marketplaceSlice';
import notificationReducer from './slices/notificationSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  marketplace: marketplaceReducer,
  notification: notificationReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

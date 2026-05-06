import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import appReducer from './slices/appSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  app: appReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;

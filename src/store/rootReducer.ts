import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import appReducer from './slices/appSlice';
import registerReducer from './slices/registerSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  app: appReducer,
  register: registerReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;

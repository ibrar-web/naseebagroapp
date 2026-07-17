import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import appReducer from './slices/appSlice';
import registerReducer from './slices/registerSlice';
import publicDataReducer from './slices/publicDataSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  app: appReducer,
  register: registerReducer,
  publicData: publicDataReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;

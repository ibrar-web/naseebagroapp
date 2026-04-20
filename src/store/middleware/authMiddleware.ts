import { Middleware } from '@reduxjs/toolkit';

export const authMiddleware: Middleware = () => (next) => (action) => {
  return next(action);
};

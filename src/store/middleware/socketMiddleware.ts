import { Middleware } from '@reduxjs/toolkit';

export const socketMiddleware: Middleware = () => (next) => (action) => {
  return next(action);
};

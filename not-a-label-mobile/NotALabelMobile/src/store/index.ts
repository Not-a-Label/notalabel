// Redux Store for Not a Label Mobile App

import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import playerSlice from './slices/playerSlice';
import musicSlice from './slices/musicSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    player: playerSlice,
    music: musicSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
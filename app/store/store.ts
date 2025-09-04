import { configureStore } from '@reduxjs/toolkit';
import widgetsReducer from './slices/widgetsSlice';
import apiReducer from './slices/apiSlice';

export const store = configureStore({
  reducer: {
    widgets: widgetsReducer,
    api: apiReducer,
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

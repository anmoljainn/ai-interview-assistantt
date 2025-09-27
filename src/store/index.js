import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import interviewReducer from './interviewSlice';
import candidateReducer from './candidateSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['interview', 'candidates'],
};

const persistedInterviewReducer = persistReducer(persistConfig, interviewReducer);
const persistedCandidateReducer = persistReducer(persistConfig, candidateReducer);

export const store = configureStore({
  reducer: {
    interview: persistedInterviewReducer,
    candidates: persistedCandidateReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
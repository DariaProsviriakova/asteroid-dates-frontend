import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { asteroidDatesReducer } from './asteroidDatesSlice';
import { authReducer } from './authSlice';

export function createAppStore() {
  return configureStore({
    reducer: { auth: authReducer, dates: asteroidDatesReducer },
    // configureStore включает redux-thunk через getDefaultMiddleware.
    middleware: getDefaultMiddleware => getDefaultMiddleware(),
    devTools: import.meta.env.DEV,
  });
}

export const store = createAppStore();
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const selectBusy = ({ auth, dates }: RootState) => auth.pending !== null ||
  [dates.list, dates.feed, dates.draft, dates.mutation].some(request => request.status === 'pending');

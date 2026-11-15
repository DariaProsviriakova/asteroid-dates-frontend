import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Observer } from '../types/observer';

type AuthOperation = 'login' | 'logout' | 'register';
export interface AuthState {
  observer: Observer | null;
  status: 'guest' | 'authenticated';
  pending: AuthOperation | null;
  error: string | null;
}

// Профиль живёт в памяти. Cookie с идентификатором сессии хранит браузер.
const initialState: AuthState = { observer: null, status: 'guest', pending: null, error: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    requestStarted(state, action: PayloadAction<AuthOperation>) {
      state.pending = action.payload;
      state.error = null;
    },
    requestFinished(state) { state.pending = null; },
    requestFailed(state, action: PayloadAction<string>) {
      state.pending = null;
      state.error = action.payload;
    },
    signedIn(_state, action: PayloadAction<Observer>): AuthState {
      return { ...initialState, observer: action.payload, status: 'authenticated' };
    },
    signedOut: () => initialState,
    sessionExpired: (): AuthState => ({ ...initialState, error: 'Сессия истекла. Войдите снова.' }),
    clearAuthError(state) { state.error = null; },
  },
});

export const { requestStarted, requestFinished, requestFailed, signedIn, signedOut, sessionExpired, clearAuthError } = authSlice.actions;
export const authReducer = authSlice.reducer;

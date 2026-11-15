import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Observer } from '../types/observer';

export const AUTH_STATUS = { GUEST: 0, CREATOR: 1 } as const;

type AuthOperation = 'login' | 'logout';
export interface AuthState {
  observer: Observer | null;
  status: (typeof AUTH_STATUS)[keyof typeof AUTH_STATUS];
  pending: AuthOperation | null;
  error: string | null;
}

// Redux не восстанавливается из хранилищ браузера; после F5 снова GUEST.
const initialState: AuthState = { observer: null, status: AUTH_STATUS.GUEST, pending: null, error: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    requestStarted(state, action: PayloadAction<AuthOperation>) {
      state.pending = action.payload;
      state.error = null;
    },
    requestFailed(state, action: PayloadAction<string>) {
      state.pending = null;
      state.error = action.payload;
    },
    signedIn(_state, action: PayloadAction<Observer>): AuthState {
      return { ...initialState, observer: action.payload, status: AUTH_STATUS.CREATOR };
    },
    signedOut: () => initialState,
    sessionExpired: (): AuthState => ({ ...initialState, error: 'Сессия истекла. Войдите снова.' }),
    clearAuthError(state) { state.error = null; },
  },
});

export const { requestStarted, requestFailed, signedIn, signedOut, sessionExpired, clearAuthError } = authSlice.actions;
export const authReducer = authSlice.reducer;

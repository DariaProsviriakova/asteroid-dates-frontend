import { Api } from './generated/AsteroidDatesApi';

export const asteroidDatesApi = new Api({ withCredentials: true, timeout: 10000 }).api;

// После F5 cookie остаётся в браузере. Гостевой GET просит прокси не пересылать её.
export const dateReadConfig = (signal: AbortSignal, isGuest: boolean) => ({
  signal,
  ...(isGuest ? { headers: { 'X-Asteroids-Guest': '1' } } : {}),
});

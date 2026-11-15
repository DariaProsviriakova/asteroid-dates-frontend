import { Api } from './generated/AsteroidDatesApi';

const client = new Api({ withCredentials: true, timeout: 10000 });
export const asteroidDatesApi = client.api;

// DELETE в OpenAPI ЛР4 описан примером без схемы. Используем общий Axios-транспорт.
export function requestAsteroidDateDeletion(id: number, signal: AbortSignal) {
  return client.request<{ data: { id: number; isDeleted: 1 } }>({
    path: `/api/dates/${id}`, method: 'DELETE', format: 'json', signal,
  });
}

// После F5 cookie остаётся в браузере. Гостевой GET просит прокси не пересылать её.
export const dateReadConfig = (signal: AbortSignal, isGuest: boolean) => ({
  signal,
  ...(isGuest ? { headers: { 'X-Asteroids-Guest': '1' } } : {}),
});

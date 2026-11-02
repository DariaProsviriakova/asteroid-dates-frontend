import type { ApiResponse } from '../types/date';

/** Настоящий fetch; в ЛР5 запросы перехватывает MSW до обращения к серверу. */
export async function getDatesResource<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(path, { signal, credentials: 'include' });
  if (!response.ok) throw new Error(`Не удалось загрузить даты (HTTP ${response.status}).`);
  const body = await response.json() as ApiResponse<T>;
  return body.data;
}

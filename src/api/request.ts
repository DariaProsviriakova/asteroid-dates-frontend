import type { ApiResponse } from '../types/date';

export async function requestResource<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, { credentials: 'include', ...init });
  const body = await response.json() as ApiResponse<T> & { message?: string };
  if (!response.ok) throw new Error(body.message ?? `Не удалось выполнить запрос (HTTP ${response.status}).`);
  return body.data;
}

export function jsonRequest(method: string, value: unknown): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) };
}

import { isAxiosError } from 'axios';

export function apiStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}

export function isServiceUnavailable(error: unknown): boolean {
  return isAxiosError(error) && !error.config?.signal?.aborted && (
    ['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT'].includes(error.code ?? '') ||
    [502, 503, 504].includes(error.response?.status ?? 0)
  );
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (isServiceUnavailable(error)) return 'Сервис недоступен. Попробуйте ещё раз позже.';
  if (!isAxiosError<{ message?: string | string[] }>(error)) return fallback;
  const message = error.response?.data?.message;
  if (typeof message === 'string' && message.trim()) return message;
  if (Array.isArray(message) && message.every(item => typeof item === 'string')) return message.join('. ');
  return fallback;
}

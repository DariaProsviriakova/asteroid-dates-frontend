import { useEffect, useRef, useState } from 'react';
import { requestResource } from '../api/request';

/** Отменяет отправку при уходе со страницы и показывает ошибку рядом с действием. */
export function useRequest() {
  const controller = useRef<AbortController | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  async function run<T>(path: string, init: RequestInit): Promise<T | null> {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setPending(true);
    setError(null);
    try {
      const data = await requestResource<T>(path, { ...init, signal: current.signal });
      return current.signal.aborted ? null : data;
    } catch (cause) {
      if (!current.signal.aborted) setError(cause instanceof Error ? cause.message : 'Нет соединения. Повторите попытку.');
      return null;
    } finally {
      if (!current.signal.aborted) setPending(false);
    }
  }
  return { run, pending, error };
}

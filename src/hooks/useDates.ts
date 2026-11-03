import { useEffect, useState } from 'react';
import { getDatesResource } from '../api/dates';

export function useDates<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setData(null);

    getDatesResource<T>(path, controller.signal)
      .then(result => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : 'Ошибка загрузки.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    // При смене фильтра/страницы старый запрос не сможет перезаписать новые данные.
    return () => controller.abort();
  }, [path, revision]);

  return { data, setData, loading, error, reload: () => setRevision(value => value + 1) };
}

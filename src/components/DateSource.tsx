import type { DateSource as Source } from '../store/asteroidDatesThunks';

export function DateSource({ source, inFeed = false }: { source: Source | null; inFeed?: boolean }) {
  if (source !== 'mock') return null;
  return <p className={inFeed ? 'date-source date-source-feed' : 'date-source'} data-source="mock" role="status">
    Mock · сервис недоступен
  </p>;
}

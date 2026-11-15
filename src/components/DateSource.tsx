import type { DateSource as Source } from '../store/asteroidDatesThunks';

export function DateSource({ source, inFeed = false }: { source: Source | null; inFeed?: boolean }) {
  if (!source) return null;
  return <p className={inFeed ? 'date-source date-source-feed' : 'date-source'} data-source={source} role="status">
    {source === 'mock' ? 'Mock · сервис недоступен' : 'Данные веб-сервиса'}
  </p>;
}

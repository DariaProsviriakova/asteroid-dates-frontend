import { Button } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { DateVideo } from '../components/DateMedia';
import { Icon } from '../components/Icon';
import { ErrorState, LoadingState } from '../components/ResourceState';
import { useDates } from '../hooks/useDates';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatApproach, formatDistance } from '../lib/format';
import type { AsteroidDate } from '../types/date';

export function FeedPage() {
  useDocumentTitle('Лента наблюдений');
  const [params, setParams] = useSearchParams();
  const id = params.get('id');
  const requestParams = new URLSearchParams();
  if (id && /^\d+$/.test(id)) requestParams.set('id', id);
  if (params.get('next') === 'true') requestParams.set('next', 'true');
  const query = requestParams.toString();
  const { data: date, loading, error, reload } = useDates<AsteroidDate>(`/api/dates/feed${query ? `?${query}` : ''}`);

  return <section className="feed-section" aria-labelledby="feed-title">
    <div className="section-heading feed-heading"><div><p className="eyebrow dark">ОДНА ДАТА — ОДНА ИСТОРИЯ</p><h1 id="feed-title">Лента наблюдений</h1></div><Link className="text-link" to="/dates">Все даты<Icon name="grid" size={17} /></Link></div>
    {loading && <LoadingState />}
    {error && <ErrorState message={error} onRetry={reload} />}
    {!loading && !error && date && <article className="feed-card">
      <DateVideo src={date.videoUrl} poster={date.imageUrl} designation={date.designation} ambient />
      <div className="feed-shade" />
      <div className="feed-top"><span className="feed-chip"><i />БЛИЖНИЙ КОСМОС</span><span className="feed-number">ОБЪЕКТ / {date.designation}</span></div>
      <div className="feed-main"><p className="eyebrow">СБЛИЖЕНИЕ С ЗЕМЛЁЙ</p><h2>{date.designation}</h2><p className="feed-description">{date.shortDescription}</p><Link className="feed-detail" to={`/dates/${date.id}`}>Подробнее о дате<Icon name="arrow" size={19} /></Link></div>
      <div className="feed-bottom"><div className="feed-facts"><div><span>Дата сближения</span><strong>{formatApproach(date.approachDay, date.approachMonth)} 2026</strong></div><div><span>Минимальное расстояние</span><strong>{formatDistance(date.minimumDistanceAu)}</strong></div><span className="feed-likes" aria-label={`Лайков: ${date.likesCount}`}><Icon name="heart" size={21} />{date.likesCount}</span></div><Button className="next-date-button" onClick={() => setParams({ id: String(date.id), next: 'true' })}>Следующая дата<Icon name="arrow" /></Button></div>
      {!date.videoUrl?.trim() && <span className="feed-default-note">Видео по умолчанию</span>}
    </article>}
    <p className="feed-footnote">Остановитесь на мгновение. Где-то рядом продолжается движение.</p>
  </section>;
}

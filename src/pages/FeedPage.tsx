import { Alert } from 'react-bootstrap';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { DateVideo } from '../components/DateMedia';
import { ErrorState, LoadingState } from '../components/ResourceState';
import { useDates } from '../hooks/useDates';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatApproach, formatDistance } from '../lib/format';
import type { AsteroidDate } from '../types/date';
import { NotFoundPage } from './NotFoundPage';
import { jsonRequest } from '../api/request';
import { useRequest } from '../hooks/useRequest';

export function FeedPage() {
  useDocumentTitle('Лента');
  const route = useParams();
  const [params, setParams] = useSearchParams();
  const id = params.get('id') ?? route.id;
  const requestParams = new URLSearchParams();
  if (id) requestParams.set('id', id);
  if (params.get('next') === 'true') requestParams.set('next', 'true');
  const query = requestParams.toString();
  const { data: date, setData, loading, error, reload } = useDates<AsteroidDate | null>('/api/dates/feed' + (query ? '?' + query : ''));
  const { run, pending, error: actionError } = useRequest();

  if (!loading && !error && !date) return id ? <NotFoundPage /> : <main className="form-page not-found-page" id="main-content"><header className="page-header"><h1>ЛЕНТА</h1></header><p>Дат пока нет. Добавьте первое наблюдение.</p><Link className="primary-button" to="/dates/add">Добавить дату</Link></main>;
  return <main className="feed-page" id="main-content" data-date-id={date?.id}>
    {loading && <LoadingState />}
    {error && <ErrorState message={error} onRetry={reload} />}
    {!loading && !error && date && <>
      <div className="feed-media"><DateVideo src={date.videoUrl} poster={date.imageUrl} designation={date.designation} ambient /></div>
      <div className="feed-shade" />
      <section className="feed-content">
        <p className="feed-designation">{date.designation}</p>
        <h1>МИНИМАЛЬНОЕ РАССТОЯНИЕ ДО ЗЕМЛИ</h1>
        <details className="feed-description" key={date.id}><summary><span>{date.shortDescription}</span></summary></details>
      </section>
      <aside className="feed-side" aria-label="Дата и расстояние сближения">
        <div className="feed-params"><span>Дата</span><strong>{formatApproach(date.approachDay, date.approachMonth)}</strong><span>Расстояние</span><strong>{formatDistance(date.minimumDistanceAu)}</strong></div>
        <button type="button" className="like-stack" aria-label={'Нравится ' + date.designation} aria-pressed={Boolean(date.isLiked)} disabled={pending} onClick={async () => {
          const updated = await run<AsteroidDate>('/api/dates/' + date.id + '/like', jsonRequest('POST', { like: date.isLiked ? 0 : 1 }));
          if (updated) setData(updated);
        }}><span className="heart-icon">{date.isLiked ? '♥' : '♡'}</span><span className="like-count">{date.likesCount}</span></button>
        <button type="button" className="next-icon-button" aria-label="Следующая дата" disabled={pending} onClick={() => setParams({ id: String(date.id), next: 'true' })}><span>→</span></button>
      </aside>
      {actionError && <Alert variant="danger" className="feed-action-error" role="alert">{actionError}</Alert>}
    </>}
  </main>;
}

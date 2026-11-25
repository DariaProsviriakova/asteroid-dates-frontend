import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { DateLike } from '../components/DateLike';
import { DateVideo } from '../components/DateMedia';
import { NotFoundState } from '../components/NotFoundState';
import { ErrorState } from '../components/ResourceState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatApproach, formatDistance } from '../lib/format';
import { loadAsteroidFeedDate } from '../store/asteroidDatesThunks';
import { useAppDispatch, useAppSelector } from '../store/store';

export function FeedPage() {
  useDocumentTitle('Лента');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const route = useParams();
  const [params] = useSearchParams();
  const rawId = params.get('id') ?? route.id;
  const id = rawId === undefined ? undefined : Number(rawId);
  const invalidId = id !== undefined && (!Number.isSafeInteger(id) || id < 1 || !/^\d+$/.test(rawId ?? ''));
  const next = params.get('next') === 'true';
  const { data: date, status, error } = useAppSelector(state => state.dates.feed);
  const auth = useAppSelector(state => state.auth.status);
  const [revision, refresh] = useState(0);

  useEffect(() => {
    if (invalidId) return;
    const request = dispatch(loadAsteroidFeedDate({ id, ...(next ? { next } : {}) }));
    return () => request.abort();
  }, [dispatch, id, invalidId, next, auth, revision]);

  if (invalidId || (status === 'succeeded' && !date)) return <NotFoundState />;
  return <main className="feed-page" id="main-content" data-date-id={date?.id}>
    {status === 'failed' && error && <ErrorState message={error} onRetry={() => refresh(previous => previous + 1)} />}
    {status === 'succeeded' && date && <>
      <div className="feed-media"><DateVideo src={date.videoUrl} poster={date.imageUrl} designation={date.designation} ambient /></div>
      <div className="feed-shade" />
      <section className="feed-content">
        <p className="feed-designation">{date.designation}</p>
        <h1>МИНИМАЛЬНОЕ РАССТОЯНИЕ ДО ЗЕМЛИ</h1>
        {date.shortDescription && <details className="feed-description" key={date.id}><summary><span>{date.shortDescription}</span></summary></details>}
      </section>
      <aside className="feed-side" aria-label="Дата и расстояние сближения">
        <div className="feed-params"><span>Дата</span><strong>{formatApproach(date.approachDay, date.approachMonth)}</strong><span>Расстояние</span><strong>{formatDistance(date.minimumDistanceAu)}</strong></div>
        <DateLike date={date} inFeed />
        <button type="button" className="next-icon-button" aria-label="Следующая дата" onClick={() => {
          if (id === date.id && next) refresh(previous => previous + 1);
          else navigate(`/dates/feed?id=${date.id}&next=true`);
        }}><span aria-hidden="true">→</span></button>
      </aside>
    </>}
  </main>;
}

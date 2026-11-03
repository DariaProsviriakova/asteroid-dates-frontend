import { Alert, Button } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { DateCard } from '../components/DateCard';
import { DatesFilter } from '../components/DatesFilter';
import { ErrorState, LoadingState } from '../components/ResourceState';
import { useDates } from '../hooks/useDates';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useRequest } from '../hooks/useRequest';
import { jsonRequest } from '../api/request';
import { parseFilters, serializeFilters } from '../lib/filters';
import type { AsteroidDate } from '../types/date';

export function DatesPage() {
  useDocumentTitle('Выбор даты');
  const [params, setParams] = useSearchParams();
  const filters = parseFilters(params);
  const query = serializeFilters(filters).toString();
  const { data, setData, loading, error, reload } = useDates<AsteroidDate[]>('/api/dates' + (query ? '?' + query : ''));
  const { run, pending, error: actionError } = useRequest();
  const deleteDate = async (date: AsteroidDate) => {
    if (pending) return;
    if (await run('/api/dates/' + date.id, { method: 'DELETE' })) setData(current => current?.filter(item => item.id !== date.id) ?? null);
  };
  const likeDate = async (date: AsteroidDate) => {
    if (pending) return;
    const updated = await run<AsteroidDate>('/api/dates/' + date.id + '/like', jsonRequest('POST', { like: date.isLiked ? 0 : 1 }));
    if (updated) setData(current => current?.map(item => item.id === updated.id ? updated : item) ?? null);
  };

  return <main className="dates-page" id="main-content">
    <header className="dates-header"><h1>ВЫБОР ДАТЫ</h1><Link className="registration-link" to="/register">Регистрация</Link></header>
    <DatesFilter filters={filters} onApply={values => setParams(serializeFilters(values))} />
    {actionError && <Alert variant="danger" role="alert">{actionError}</Alert>}
    <div aria-live="polite" aria-busy={loading}>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && data?.length === 0 && <div className="empty-list">{filters.maxMonth < 12 ? <><p>До месяца {filters.maxMonth} ничего не найдено.</p><Button className="filter-button" onClick={() => setParams({})}>Сбросить фильтр</Button></> : <><p>Дат пока нет. Добавьте первое наблюдение.</p><Link className="filter-button" to="/dates/add">Добавить дату</Link></>}</div>}
      {!loading && !error && data && <section className="dates-grid" aria-label="Список дат">{data.map(date => <DateCard key={date.id} date={date} pending={pending} onDelete={deleteDate} onLike={likeDate} />)}</section>}
    </div>
  </main>;
}

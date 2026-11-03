import { Button } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { DateCard } from '../components/DateCard';
import { DatesFilter } from '../components/DatesFilter';
import { ErrorState, LoadingState } from '../components/ResourceState';
import { useDates } from '../hooks/useDates';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { parseFilters, serializeFilters } from '../lib/filters';
import type { AsteroidDate } from '../types/date';

export function DatesPage() {
  useDocumentTitle('Выбор даты');
  const [params, setParams] = useSearchParams();
  const filters = parseFilters(params);
  const query = serializeFilters(filters).toString();
  const { data, loading, error, reload } = useDates<AsteroidDate[]>('/api/dates' + (query ? '?' + query : ''));

  return <main className="dates-page" id="main-content">
    <header className="dates-header"><h1>ВЫБОР ДАТЫ</h1><Link className="registration-link" to="/register">Регистрация</Link></header>
    <DatesFilter filters={filters} onApply={values => setParams(serializeFilters(values))} />
    <div aria-live="polite" aria-busy={loading}>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && data?.length === 0 && <div className="empty-list"><p>До месяца {filters.maxMonth} ничего не найдено.</p><Button className="filter-button" onClick={() => setParams({})}>Сбросить фильтр</Button></div>}
      {!loading && !error && data && <section className="dates-grid" aria-label="Список дат">{data.map(date => <DateCard key={date.id} date={date} />)}</section>}
    </div>
  </main>;
}

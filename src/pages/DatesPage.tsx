import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { DateCard } from '../components/DateCard';
import { DatesFilter } from '../components/DatesFilter';
import { ErrorState } from '../components/ResourceState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { DEFAULT_FILTERS } from '../lib/filters';
import { maxMonthChanged } from '../store/asteroidDatesSlice';
import { loadPublishedAsteroidDates } from '../store/asteroidDatesThunks';
import { useAppDispatch, useAppSelector } from '../store/store';

export function DatesPage() {
  useDocumentTitle('Выбор даты');
  const dispatch = useAppDispatch();
  const { filters, list } = useAppSelector(state => state.dates);
  const { observer, status } = useAppSelector(state => state.auth);
  const [revision, refresh] = useState(0);

  useEffect(() => {
    const request = dispatch(loadPublishedAsteroidDates());
    return () => request.abort();
  }, [dispatch, filters.maxMonth, status, revision]);

  return <main className="dates-page" id="main-content" tabIndex={-1}>
    <header className="dates-header"><h1>ВЫБОР ДАТЫ</h1>
      {observer && <span className="observer-name">{observer.fullName}</span>}
    </header>
    <DatesFilter filters={filters} onApply={values => {
      if (values.maxMonth === filters.maxMonth) refresh(previous => previous + 1);
      else dispatch(maxMonthChanged(values.maxMonth));
    }} />
    {list.status === 'failed' && list.error && <ErrorState message={list.error} onRetry={() => refresh(previous => previous + 1)} />}
    {list.status === 'succeeded' && <>
      {list.data.length === 0 ? <div className="empty-list"><p>До месяца {filters.maxMonth} ничего не найдено.</p>
        {filters.maxMonth !== DEFAULT_FILTERS.maxMonth && <Button className="filter-button" onClick={() => dispatch(maxMonthChanged(DEFAULT_FILTERS.maxMonth))}>Сбросить фильтр</Button>}
      </div> : <section className="dates-grid" aria-label="Список дат">{list.data.map(date => <DateCard key={date.id} date={date} />)}</section>}
    </>}
  </main>;
}

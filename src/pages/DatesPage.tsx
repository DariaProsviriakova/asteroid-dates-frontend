import { Button, Col, Row } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { DateCard } from '../components/DateCard';
import { DatesFilter } from '../components/DatesFilter';
import { ErrorState, LoadingState } from '../components/ResourceState';
import { Icon } from '../components/Icon';
import { useDates } from '../hooks/useDates';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { parseFilters, serializeFilters } from '../lib/filters';
import type { AsteroidDate } from '../types/date';

export function DatesPage() {
  useDocumentTitle('Даты сближений');
  const [params, setParams] = useSearchParams();
  const filters = parseFilters(params);
  const query = serializeFilters(filters).toString();
  const { data, loading, error, reload } = useDates<AsteroidDate[]>(`/api/dates${query ? `?${query}` : ''}`);

  return <>
    <section className="catalog-hero" aria-labelledby="catalog-title">
      <div className="hero-copy"><p className="eyebrow"><span />НАВСТРЕЧУ НЕИЗВЕСТНОМУ</p><h1 id="catalog-title">Ближе<br />к космосу<span>.</span></h1><p className="hero-description">У каждого сближения — своя дата.<br />Найдите ту, за которой хочется наблюдать.</p><div className="hero-caption"><Icon name="orbit" size={20} /><span>Астероиды. Земля. Точки встречи.</span></div></div>
      <div className="hero-coordinate" aria-hidden="true"><span>БЛИЖНИЙ КОСМОС</span><span>ЗЕМЛЯ / СОЛНЕЧНАЯ СИСТЕМА</span><i /></div>
      <div className="hero-edition">КОЛЛЕКЦИЯ НАБЛЮДЕНИЙ<span>2026</span></div>
    </section>
    <section className="catalog-section" aria-labelledby="dates-title">
      <div className="section-heading"><div><p className="eyebrow dark">ВЫБЕРИТЕ СВОЮ ДАТУ</p><h2 id="dates-title">Даты сближений<span className="count-badge" aria-label={`Найдено дат: ${data?.length ?? 0}`}>{data?.length ?? '—'}</span></h2></div><span className="section-note">Чуть больше внимания к небу.</span></div>
      <DatesFilter filters={filters} onApply={values => setParams(serializeFilters(values))} />
      <div aria-live="polite" aria-busy={loading}>
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && data?.length === 0 && <div className="empty-state"><Icon name="search" size={32} /><h3>Таких дат пока нет</h3><p>Попробуйте другой месяц или название астероида.</p><Button variant="outline-primary" onClick={() => setParams({})}>Сбросить фильтры</Button></div>}
        {!loading && !error && data && data.length > 0 && <Row className="g-4 dates-grid">{data.map((date, index) => <Col key={date.id} lg={4} sm={6}><DateCard date={date} index={index} /></Col>)}</Row>}
      </div>
    </section>
    <p className="catalog-footnote"><span>УЧЕБНЫЙ КАТАЛОГ</span>Демонстрационные данные и иллюстрации. Не астрономический прогноз.</p>
  </>;
}

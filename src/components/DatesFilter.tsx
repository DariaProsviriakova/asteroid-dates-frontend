import { useEffect, useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import type { DatesFilters } from '../types/date';
import { DEFAULT_FILTERS } from '../lib/filters';
import { MONTHS } from '../lib/format';
import { Icon } from './Icon';

interface DatesFilterProps {
  filters: DatesFilters;
  onApply: (filters: DatesFilters) => void;
}

/** Управляемые поля хранят черновик; родитель получает значения через callback-prop. */
export function DatesFilter({ filters, onApply }: DatesFilterProps) {
  const [query, setQuery] = useState(filters.query);
  const [maxMonth, setMaxMonth] = useState(filters.maxMonth);
  const [sort, setSort] = useState(filters.sort);

  useEffect(() => {
    setQuery(filters.query);
    setMaxMonth(filters.maxMonth);
    setSort(filters.sort);
  }, [filters.query, filters.maxMonth, filters.sort]);

  return <Form className="filter-panel" onSubmit={event => {
    event.preventDefault();
    onApply({ query: query.trim(), maxMonth, sort });
  }} aria-label="Фильтры дат">
    <Row className="g-4 align-items-end">
      <Col lg={4} md={6}>
        <Form.Group controlId="date-query"><Form.Label>Название астероида</Form.Label><div className="search-field"><Icon name="search" size={18} /><Form.Control type="search" placeholder="Например, 2026 KJ" value={query} maxLength={120} onChange={event => setQuery(event.target.value)} /></div></Form.Group>
      </Col>
      <Col lg={4} md={6}>
        <Form.Group controlId="date-month"><Form.Label className="month-label">Сближения до месяца <span>{MONTHS[maxMonth - 1]}</span></Form.Label><Form.Range min={1} max={12} step={1} value={maxMonth} aria-valuetext={MONTHS[maxMonth - 1]} onChange={event => setMaxMonth(Number(event.target.value))} /><div className="range-endpoints"><span>Январь</span><span>Декабрь</span></div></Form.Group>
      </Col>
      <Col lg={2} md={6}>
        <Form.Group controlId="date-sort"><Form.Label>Порядок</Form.Label><Form.Select value={sort} onChange={event => setSort(event.target.value as DatesFilters['sort'])}><option value="date">По дате</option><option value="distance">По расстоянию</option><option value="name">По названию</option></Form.Select></Form.Group>
      </Col>
      <Col lg={2} md={6} className="filter-actions"><Button type="submit" className="apply-button">Показать<Icon name="arrow" size={17} /></Button><Button type="button" variant="link" className="reset-button" onClick={() => { setQuery(''); setMaxMonth(12); setSort('date'); onApply({ ...DEFAULT_FILTERS }); }}>Сбросить</Button></Col>
    </Row>
  </Form>;
}

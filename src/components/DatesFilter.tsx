import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import type { DatesFilters } from '../types/date';

interface DatesFilterProps {
  filters: DatesFilters;
  onApply: (filters: DatesFilters) => void;
}

/** Тот же ползунок месяца, что и в шаблоне бэкенда. */
export function DatesFilter({ filters, onApply }: DatesFilterProps) {
  const [maxMonth, setMaxMonth] = useState(filters.maxMonth);
  useEffect(() => setMaxMonth(filters.maxMonth), [filters.maxMonth]);

  return <Form className="filter-form range-filter-form" aria-label="Фильтр дат" onSubmit={event => {
    event.preventDefault();
    onApply({ maxMonth });
  }}>
    <label htmlFor="max-month">
      <span>Фильтр по месяцу: до {maxMonth}</span>
      <input id="max-month" name="maxMonth" type="range" min={1} max={12} step={1} value={maxMonth} list="month-marks" onChange={event => setMaxMonth(Number(event.target.value))} />
      <datalist id="month-marks">{Array.from({ length: 12 }, (_, index) => <option key={index} value={index + 1}>{index + 1}</option>)}</datalist>
      <div className="range-labels" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <span key={index}>{index + 1}</span>)}</div>
    </label>
    <Button className="filter-button" type="submit">Показать</Button>
  </Form>;
}

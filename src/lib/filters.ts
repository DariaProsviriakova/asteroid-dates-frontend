import type { AsteroidDate, DatesFilters } from '../types/date';

export const DEFAULT_FILTERS: DatesFilters = { query: '', maxMonth: 12, sort: 'date' };

export function parseFilters(params: URLSearchParams): DatesFilters {
  const month = Number(params.get('maxMonth') ?? 12);
  const sort = params.get('sort');
  return {
    query: (params.get('q') ?? '').trim().slice(0, 120),
    maxMonth: Number.isInteger(month) && month >= 1 && month <= 12 ? month : 12,
    sort: sort === 'distance' || sort === 'name' ? sort : 'date',
  };
}

export function serializeFilters(filters: DatesFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set('q', filters.query.trim());
  if (filters.maxMonth !== 12) params.set('maxMonth', String(filters.maxMonth));
  if (filters.sort !== 'date') params.set('sort', filters.sort);
  return params;
}

/** В ЛР5 фильтрация выполняется mock-сервисом над единственной коллекцией. */
export function filterDates(dates: readonly AsteroidDate[], filters: DatesFilters): AsteroidDate[] {
  const query = filters.query.trim().toLocaleLowerCase('ru-RU');
  return dates
    .filter(date => date.approachMonth <= filters.maxMonth &&
      date.designation.toLocaleLowerCase('ru-RU').includes(query))
    .sort((a, b) => {
      if (filters.sort === 'name') return a.designation.localeCompare(b.designation);
      if (filters.sort === 'distance') {
        return (a.minimumDistanceAu ?? Infinity) - (b.minimumDistanceAu ?? Infinity) || a.id - b.id;
      }
      return a.approachMonth - b.approachMonth || a.approachDay - b.approachDay || a.id - b.id;
    });
}

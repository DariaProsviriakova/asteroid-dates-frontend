import type { AsteroidDate, DatesFilters } from '../types/date';

export const DEFAULT_FILTERS: DatesFilters = { maxMonth: 12 };

export function filterDates(dates: readonly AsteroidDate[], filters: DatesFilters): AsteroidDate[] {
  return dates.filter(date => date.approachMonth !== null && date.approachMonth <= filters.maxMonth);
}

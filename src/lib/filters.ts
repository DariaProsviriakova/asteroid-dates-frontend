import type { AsteroidDate, DatesFilters } from '../types/date';

export const DEFAULT_FILTERS: DatesFilters = { maxMonth: 12 };

export function parseFilters(params: URLSearchParams): DatesFilters {
  const month = Number(params.get('maxMonth') ?? 12);
  return { maxMonth: Number.isInteger(month) && month >= 1 && month <= 12 ? month : 12 };
}

export function serializeFilters(filters: DatesFilters): URLSearchParams {
  return filters.maxMonth === 12 ? new URLSearchParams() : new URLSearchParams({ maxMonth: String(filters.maxMonth) });
}

export function filterDates(dates: readonly AsteroidDate[], filters: DatesFilters): AsteroidDate[] {
  return dates.filter(date => date.approachMonth <= filters.maxMonth);
}

export const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

export function formatApproach(day: number, month: number): string {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })
    .format(new Date(2026, month - 1, day));
}

export function formatDistance(value: number | null): string {
  return value === null ? 'Нет данных' : `${new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 3, maximumFractionDigits: 5,
  }).format(value)} а.е.`;
}

export function formatKilometers(value: number | null): string {
  return value === null ? 'Нет данных' : `≈ ${new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
  }).format(value * 149_597_870.7)} км`;
}

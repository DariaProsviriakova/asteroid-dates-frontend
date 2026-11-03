export function formatApproach(day: number, month: number): string {
  return day + ' ' + [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ][month - 1] + ' 2026';
}

export function formatDistance(value: number | null): string {
  return value === null ? 'Нет данных' : new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 3, maximumFractionDigits: 3,
  }).format(value) + ' а.е.';
}

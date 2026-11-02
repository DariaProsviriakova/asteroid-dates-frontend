import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS, filterDates, parseFilters, serializeFilters } from './filters';
import { DEFAULT_IMAGE, DEFAULT_VIDEO, resolveMedia } from './media';
import { mockDates } from '../mocks/dates';

describe('Фильтры каталога', () => {
  it('включает граничный месяц и исключает более поздние даты', () => {
    expect(filterDates(mockDates, { ...DEFAULT_FILTERS, maxMonth: 5 }).map(date => date.designation))
      .toEqual(['2026 KJ', '2026 KK3']);
  });
  it('совмещает поиск без учёта регистра с фильтром месяца', () => {
    expect(filterDates(mockDates, { ...DEFAULT_FILTERS, maxMonth: 6, query: '  kr ' }).map(date => date.id))
      .toEqual([4]);
  });
  it('возвращает пустой список для января', () => {
    expect(filterDates(mockDates, { ...DEFAULT_FILTERS, maxMonth: 1 })).toEqual([]);
  });
  it('сортирует по расстоянию, не меняя исходную коллекцию', () => {
    const before = mockDates.map(date => date.id);
    const result = filterDates(mockDates, { ...DEFAULT_FILTERS, sort: 'distance' });
    expect(result[0].designation).toBe('2026 KL2');
    expect(mockDates.map(date => date.id)).toEqual(before);
  });
  it('сохраняет фильтры в URL и читает их обратно', () => {
    const filters = { query: '2026 KJ', maxMonth: 5, sort: 'name' as const };
    expect(parseFilters(serializeFilters(filters))).toEqual(filters);
  });
  it.each(['-1', '13', 'abc', '5.5'])('заменяет неверный месяц %s значением 12', value => {
    expect(parseFilters(new URLSearchParams({ maxMonth: value, sort: 'invalid' })))
      .toEqual(DEFAULT_FILTERS);
  });
});

describe('Локальные медиа по умолчанию', () => {
  it.each([null, undefined, '', '   '])('подставляет изображение и видео при отсутствии поля: %s', value => {
    expect(resolveMedia(value, DEFAULT_IMAGE)).toBe('/media/default-date.png');
    expect(resolveMedia(value, DEFAULT_VIDEO)).toBe('/media/default-date.mp4');
  });
  it('оставляет явно заданное медиа', () => {
    expect(resolveMedia('/media/asteroid-hero.png', DEFAULT_IMAGE)).toBe('/media/asteroid-hero.png');
  });
  it('содержит демонстрационную запись без обоих медиа', () => {
    expect(mockDates.find(date => date.id === 5)).toMatchObject({ imageUrl: null, videoUrl: null });
  });
});

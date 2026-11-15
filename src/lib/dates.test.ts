import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS, filterDates } from './filters';
import { DEFAULT_IMAGE, DEFAULT_VIDEO, resolveMedia } from './media';
import { mockDates } from '../mocks/dates';

describe('Фильтр месяца из бэкенда', () => {
  it('включает граничный месяц и исключает более поздние даты', () => {
    expect(filterDates(mockDates, { maxMonth: 5 }).map(date => date.designation)).toEqual(['2026 KJ', '2026 KK3']);
  });
  it('возвращает пустой список для января', () => {
    expect(filterDates(mockDates, { maxMonth: 1 })).toEqual([]);
  });
  it('сохраняет порядок исходной коллекции', () => {
    const ids = mockDates.map(date => date.id);
    expect(filterDates(mockDates, DEFAULT_FILTERS).map(date => date.id)).toEqual(ids);
    expect(mockDates.map(date => date.id)).toEqual(ids);
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
  it('отправляет медиа MinIO через прокси, сохраняя имя объекта', () => {
    expect(resolveMedia('http://localhost:9000/asteroids-lab/asteroid-day-15.png', DEFAULT_IMAGE)).toBe('/s3/asteroids-lab/asteroid-day-15.png');
  });
  it('содержит демонстрационную запись без обоих медиа', () => {
    expect(mockDates.find(date => date.id === 5)).toMatchObject({ imageUrl: null, videoUrl: null });
  });
});

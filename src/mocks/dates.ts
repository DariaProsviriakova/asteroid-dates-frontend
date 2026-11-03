import type { AsteroidDate } from '../types/date';

/** Демонстрационные записи из предметной области ЛР1–4, не астрономический прогноз. */
export const mockDates: readonly AsteroidDate[] = [
  {
    id: 2, designation: '2026 KJ',
    shortDescription: '2026 KJ пройдет 12 мая 2026. Расчетное минимальное расстояние до Земли — 0,022 а.е.',
    approachMonth: 5, approachDay: 12, minimumDistanceAu: 0.02231,
    imageUrl: '/media/asteroid-hero.png', videoUrl: '/media/asteroid-day-12.mp4', likesCount: 5,
  },
  {
    id: 3, designation: '2026 KK3',
    shortDescription: '2026 KK3 пройдет 15 мая 2026. Расчетное минимальное расстояние до Земли — 0,043 а.е.',
    approachMonth: 5, approachDay: 15, minimumDistanceAu: 0.04297,
    imageUrl: '/media/asteroid-day-15.png', videoUrl: '/media/asteroid-day-15.mp4', likesCount: 4,
  },
  {
    id: 4, designation: '2026 KR',
    shortDescription: '2026 KR пройдет 18 июня 2026. Расчетное минимальное расстояние до Земли — 0,014 а.е.',
    approachMonth: 6, approachDay: 18, minimumDistanceAu: 0.01385,
    imageUrl: '/media/asteroid-day-18.png', videoUrl: '/media/asteroid-day-18.mp4', likesCount: 3,
  },
  {
    id: 5, designation: '2026 JD4',
    shortDescription: '2026 JD4 пройдет 21 июня 2026. Расчетное минимальное расстояние до Земли — 0,011 а.е.',
    approachMonth: 6, approachDay: 21, minimumDistanceAu: 0.01088,
    imageUrl: null, videoUrl: null, likesCount: 2,
  },
  {
    id: 6, designation: '2026 HF4',
    shortDescription: '2026 HF4 пройдет 24 июля 2026. Расчетное минимальное расстояние до Земли — 0,068 а.е.',
    approachMonth: 7, approachDay: 24, minimumDistanceAu: 0.06819,
    imageUrl: '/media/asteroid-day-24.png', videoUrl: '', likesCount: 1,
  },
  {
    id: 7, designation: '2026 KL2',
    shortDescription: '2026 KL2 пройдет 27 июля 2026. Расчетное минимальное расстояние до Земли — 0,007 а.е.',
    approachMonth: 7, approachDay: 27, minimumDistanceAu: 0.00693,
    imageUrl: '/media/asteroid-day-27.png', videoUrl: '/media/asteroid-day-27.mp4', likesCount: 1,
  },
].map((date, index) => ({
  ...date, status: 'published' as const, creatorId: index + 2,
  createdAt: '2026-05-01T10:00:00.000Z', formedAt: '2026-05-02T10:00:00.000Z',
  isCreator: 0 as const, isLiked: 0 as const,
}));

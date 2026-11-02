import type { AsteroidDate } from '../types/date';

/** Демонстрационные записи из предметной области ЛР1–4, не астрономический прогноз. */
export const mockDates: readonly AsteroidDate[] = [
  {
    id: 2, designation: '2026 KJ',
    shortDescription: 'Майское сближение с Землёй. Астероид пройдёт на расстоянии около 3,3 миллиона километров. Откройте визуализацию, чтобы рассмотреть небесное тело и его траекторию.',
    approachMonth: 5, approachDay: 12, minimumDistanceAu: 0.02231,
    imageUrl: '/media/asteroid-hero.png', videoUrl: '/media/asteroid-day-12.mp4', likesCount: 5,
  },
  {
    id: 3, designation: '2026 KK3',
    shortDescription: 'Вторая дата майской серии наблюдений. Расчётное расстояние сближения — около 6,4 миллиона километров. Изображение и видео иллюстрируют карточку наблюдения.',
    approachMonth: 5, approachDay: 15, minimumDistanceAu: 0.04297,
    imageUrl: '/media/asteroid-day-15.png', videoUrl: '/media/asteroid-day-15.mp4', likesCount: 4,
  },
  {
    id: 4, designation: '2026 KR',
    shortDescription: 'Июньское наблюдение астероида 2026 KR. Минимальное расстояние до Земли — примерно 2,1 миллиона километров. Дата включена в летнюю подборку сближений.',
    approachMonth: 6, approachDay: 18, minimumDistanceAu: 0.01385,
    imageUrl: '/media/asteroid-day-18.png', videoUrl: '/media/asteroid-day-18.mp4', likesCount: 3,
  },
  {
    id: 5, designation: '2026 JD4',
    shortDescription: 'Сближение 21 июня на расстоянии около 1,6 миллиона километров. Автор пока не добавил изображение и видео: приложение показывает локальные медиа по умолчанию.',
    approachMonth: 6, approachDay: 21, minimumDistanceAu: 0.01088,
    imageUrl: null, videoUrl: null, likesCount: 2,
  },
  {
    id: 6, designation: '2026 HF4',
    shortDescription: 'Июльская дата с самым большим расстоянием в подборке — около 10,2 миллиона километров. Видео не приложено, поэтому доступна визуализация по умолчанию.',
    approachMonth: 7, approachDay: 24, minimumDistanceAu: 0.06819,
    imageUrl: '/media/asteroid-day-24.png', videoUrl: '', likesCount: 1,
  },
  {
    id: 7, designation: '2026 KL2',
    shortDescription: 'Самое близкое сближение в учебной подборке. Астероид пройдёт примерно в 1 миллионе километров от Земли. Завершающая дата июльской серии.',
    approachMonth: 7, approachDay: 27, minimumDistanceAu: 0.00693,
    imageUrl: '/media/asteroid-day-27.png', videoUrl: '/media/asteroid-day-27.mp4', likesCount: 1,
  },
].map((date, index) => ({
  ...date, status: 'published' as const, creatorId: index + 2,
  createdAt: '2026-05-01T10:00:00.000Z', formedAt: '2026-05-02T10:00:00.000Z',
  isCreator: 0 as const, isLiked: 0 as const,
}));

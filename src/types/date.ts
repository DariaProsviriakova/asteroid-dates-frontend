import type { AsteroidDateDto } from '../api/generated/AsteroidDatesApi';

// В автономной коллекции допустимы отсутствующие медиа, обрабатываемые компонентами.
export type AsteroidDate = Omit<AsteroidDateDto, 'imageUrl' | 'videoUrl'> & {
  imageUrl: string | null;
  videoUrl: string | null;
};
export interface DatesFilters { maxMonth: number }

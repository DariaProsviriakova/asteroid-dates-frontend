/** Публичные поля карточки совпадают с сериализатором сервиса ЛР4. */
export interface AsteroidDate {
  id: number;
  designation: string;
  shortDescription: string | null;
  status: 'published';
  imageUrl: string | null;
  videoUrl: string | null;
  approachMonth: number;
  approachDay: number;
  minimumDistanceAu: number | null;
  likesCount: number;
  creatorId: number;
  createdAt: string;
  formedAt: string;
  isCreator: 0;
  isLiked: 0;
}

export interface ApiResponse<T> { data: T }
export type DatesSort = 'date' | 'distance' | 'name';
export interface DatesFilters { query: string; maxMonth: number; sort: DatesSort }

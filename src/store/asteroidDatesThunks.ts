import { createAsyncThunk } from '@reduxjs/toolkit';
import { asteroidDatesApi, dateReadConfig, requestAsteroidDateDeletion } from '../api/dates';
import { apiErrorMessage, apiStatus, isServiceUnavailable } from '../api/errors';
import type { GetFeedDateParams, PublishDateDto } from '../api/generated/AsteroidDatesApi';
import { ALLOW_MOCK_FALLBACK, IS_PAGES } from '../deployment';
import { filterDates } from '../lib/filters';
import { mockDates } from '../mocks/dates';
import type { AsteroidDate, DatesFilters } from '../types/date';
import { AUTH_STATUS, sessionExpired, type AuthState } from './authSlice';

export type DateSource = 'backend' | 'mock';
interface DateRead<T> { data: T; source: DateSource }
export interface DraftFiles { designation: string; image?: File; video?: File }

const datesThunk = createAsyncThunk.withTypes<{
  state: { auth: AuthState; dates: { filters: DatesFilters } };
  rejectValue: string;
}>();

function readMockFeed({ id, next }: GetFeedDateParams): DateRead<AsteroidDate | null> {
  const index = mockDates.findIndex(date => date.id === id);
  const date = next ? mockDates[(index + 1) % mockDates.length]
    : id === undefined ? mockDates[0] : mockDates[index];
  return { data: date ?? null, source: 'mock' };
}

export const loadPublishedAsteroidDates = datesThunk<DateRead<AsteroidDate[]>, void>(
  'dates/loadPublishedAsteroidDates', async (_, { getState, signal, rejectWithValue }) => {
    const { auth, dates: { filters } } = getState();
    if (IS_PAGES) return { data: filterDates(mockDates, filters), source: 'mock' };
    const isGuest = auth.status === AUTH_STATUS.GUEST;
    try {
      const { data } = await asteroidDatesApi.listPublishedDates({ maxMonth: filters.maxMonth }, dateReadConfig(signal, isGuest));
      return { data: data.data, source: 'backend' };
    } catch (error) {
      if (ALLOW_MOCK_FALLBACK && isGuest && !signal.aborted && isServiceUnavailable(error)) {
        return { data: filterDates(mockDates, filters), source: 'mock' };
      }
      return rejectWithValue(apiErrorMessage(error, 'Не удалось загрузить список дат.'));
    }
  },
);

export const loadAsteroidFeedDate = datesThunk<DateRead<AsteroidDate | null>, GetFeedDateParams>(
  'dates/loadAsteroidFeedDate', async (query, { getState, signal, rejectWithValue }) => {
    if (IS_PAGES) return readMockFeed(query);
    const isGuest = getState().auth.status === AUTH_STATUS.GUEST;
    try {
      const { data } = await asteroidDatesApi.getFeedDate(query, dateReadConfig(signal, isGuest));
      return { data: data.data[0] ?? null, source: 'backend' };
    } catch (error) {
      if (apiStatus(error) === 404) return { data: null, source: 'backend' };
      if (ALLOW_MOCK_FALLBACK && isGuest && !signal.aborted && isServiceUnavailable(error)) return readMockFeed(query);
      return rejectWithValue(apiErrorMessage(error, 'Не удалось загрузить ленту.'));
    }
  },
);

function protectedAsteroidRequest<Arg, Result>(
  action: string, fallback: string, request: (arg: Arg, signal: AbortSignal) => Promise<Result>,
) {
  return datesThunk<Result, Arg>(`dates/${action}`, async (arg, { getState, dispatch, signal, rejectWithValue }) => {
    if (getState().auth.status === AUTH_STATUS.GUEST) return rejectWithValue('Войдите, чтобы выполнить это действие.');
    try {
      return await request(arg, signal);
    } catch (error) {
      if (!signal.aborted && apiStatus(error) === 401) dispatch(sessionExpired());
      return rejectWithValue(apiErrorMessage(error, fallback));
    }
  });
}

export const loadAsteroidDateDraft = protectedAsteroidRequest<void, AsteroidDate | null>(
  'loadAsteroidDateDraft', 'Не удалось загрузить черновик.',
  async (_, signal) => (await asteroidDatesApi.getCurrentDraft({ signal })).data.data,
);

export const saveAsteroidDateDraft = protectedAsteroidRequest<DraftFiles, AsteroidDate>(
  'saveAsteroidDateDraft', 'Не удалось сохранить черновик.',
  async (fields, signal) => (await asteroidDatesApi.createDraft(fields, { signal })).data.data,
);

export const publishAsteroidDate = protectedAsteroidRequest<PublishDateDto, AsteroidDate>(
  'publishAsteroidDate', 'Не удалось опубликовать дату.',
  async (fields, signal) => (await asteroidDatesApi.publishDraft(fields, { signal })).data.data,
);

export const deleteAsteroidDate = protectedAsteroidRequest<number, number>(
  'deleteAsteroidDate', 'Не удалось удалить дату.',
  async (id, signal) => (await requestAsteroidDateDeletion(id, signal)).data.data.id,
);

export const setAsteroidDateLike = protectedAsteroidRequest<{ id: number; like: 0 | 1 }, AsteroidDate>(
  'setAsteroidDateLike', 'Не удалось изменить лайк.',
  async ({ id, like }, signal) => (await asteroidDatesApi.setLike({ id }, { like }, { signal })).data.data.date,
);

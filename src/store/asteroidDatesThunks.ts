import { createAsyncThunk } from '@reduxjs/toolkit';
import { asteroidDatesApi, dateReadConfig } from '../api/dates';
import { apiErrorMessage, apiStatus, isServiceUnavailable } from '../api/errors';
import type { GetFeedDateParams, PublishDateDto } from '../api/generated/AsteroidDatesApi';
import { filterDates } from '../lib/filters';
import { mockDates } from '../mocks/dates';
import type { AsteroidDate, DatesFilters } from '../types/date';
import { sessionExpired, type AuthState } from './authSlice';

export type DateSource = 'backend' | 'mock';
interface DateRead<T> { data: T; source: DateSource }
export interface DraftFiles { designation: string; image?: File; video?: File }

const datesThunk = createAsyncThunk.withTypes<{
  state: { auth: AuthState; dates: { filters: DatesFilters } };
  rejectValue: string;
}>();

export const loadPublishedAsteroidDates = datesThunk<DateRead<AsteroidDate[]>, void>(
  'dates/loadPublishedAsteroidDates', async (_, { getState, signal, rejectWithValue }) => {
    const { auth, dates: { filters } } = getState();
    const isGuest = auth.status === 'guest';
    try {
      const { data } = await asteroidDatesApi.listPublishedDates({ maxMonth: filters.maxMonth }, dateReadConfig(signal, isGuest));
      return { data: data.data, source: 'backend' };
    } catch (error) {
      if (isGuest && !signal.aborted && isServiceUnavailable(error)) {
        return { data: filterDates(mockDates, filters), source: 'mock' };
      }
      return rejectWithValue(apiErrorMessage(error, 'Не удалось загрузить список дат.'));
    }
  },
);

export const loadAsteroidFeedDate = datesThunk<DateRead<AsteroidDate | null>, GetFeedDateParams>(
  'dates/loadAsteroidFeedDate', async (query, { getState, signal, rejectWithValue }) => {
    const isGuest = getState().auth.status === 'guest';
    try {
      const { data } = await asteroidDatesApi.getFeedDate(query, dateReadConfig(signal, isGuest));
      return { data: data.data[0] ?? null, source: 'backend' };
    } catch (error) {
      if (apiStatus(error) === 404) return { data: null, source: 'backend' };
      if (isGuest && !signal.aborted && isServiceUnavailable(error)) {
        const index = mockDates.findIndex(date => date.id === query.id);
        const date = query.next ? mockDates[(index + 1) % mockDates.length]
          : query.id === undefined ? mockDates[0] : mockDates[index];
        return { data: date ?? null, source: 'mock' };
      }
      return rejectWithValue(apiErrorMessage(error, 'Не удалось загрузить ленту.'));
    }
  },
);

function protectedAsteroidRequest<Arg, Result>(
  action: string, fallback: string, request: (arg: Arg, signal: AbortSignal) => Promise<Result>,
) {
  return datesThunk<Result, Arg>(`dates/${action}`, async (arg, { getState, dispatch, signal, rejectWithValue }) => {
    if (getState().auth.status === 'guest') return rejectWithValue('Войдите, чтобы выполнить это действие.');
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
  async (id, signal) => {
    await asteroidDatesApi.deleteDate({ id }, { signal });
    return id;
  },
);

export const setAsteroidDateLike = protectedAsteroidRequest<{ id: number; like: 0 | 1 }, AsteroidDate>(
  'setAsteroidDateLike', 'Не удалось изменить лайк.',
  async ({ id, like }, signal) => (await asteroidDatesApi.setLike({ id }, { like }, { signal })).data.data.date,
);

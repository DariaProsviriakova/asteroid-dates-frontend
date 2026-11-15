import { AxiosError } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { asteroidDatesApi } from '../api/dates';
import { maxMonthChanged } from './asteroidDatesSlice';
import { loadAsteroidDateDraft, loadAsteroidFeedDate, loadPublishedAsteroidDates } from './asteroidDatesThunks';
import { signedIn, signedOut } from './authSlice';
import { createAppStore } from './store';

const observer = { id: 42, fullName: 'Тестовый наблюдатель', email: 'observer@example.test' };
const unavailable = new AxiosError('Unavailable', 'ERR_NETWORK');

afterEach(() => vi.restoreAllMocks());

describe('Redux и запросы к каталогу', () => {
  it('передаёт фильтр из Redux в API и при сбое применяет его к mock только для гостя', async () => {
    const list = vi.spyOn(asteroidDatesApi, 'listPublishedDates').mockRejectedValue(unavailable);
    const store = createAppStore();
    store.dispatch(maxMonthChanged(5));
    await store.dispatch(loadPublishedAsteroidDates());
    expect(list).toHaveBeenLastCalledWith({ maxMonth: 5 }, expect.objectContaining({ headers: { 'X-Asteroids-Guest': '1' } }));
    expect(store.getState().dates.list).toMatchObject({ status: 'succeeded', source: 'mock' });
    expect(store.getState().dates.list.data.map(date => date.id)).toEqual([2, 3]);

    store.dispatch(signedIn(observer));
    expect(store.getState().auth).toMatchObject({ status: 1, observer });
    await store.dispatch(loadPublishedAsteroidDates());
    expect(list.mock.lastCall?.[1]).not.toHaveProperty('headers');
    expect(store.getState().dates.list).toMatchObject({ status: 'failed', source: null, data: [] });
  });

  it('не заменяет серверный 404 знакомой mock-карточкой', async () => {
    const missing = Object.assign(new AxiosError('Not found'), { response: { status: 404 } });
    vi.spyOn(asteroidDatesApi, 'getFeedDate').mockRejectedValue(missing);
    const store = createAppStore();
    await store.dispatch(loadAsteroidFeedDate({ id: 2 }));
    expect(store.getState().dates.feed).toMatchObject({ status: 'succeeded', source: 'backend', data: null });
  });

  it('не подменяет черновик при сбое и не запрашивает его от имени гостя', async () => {
    const load = vi.spyOn(asteroidDatesApi, 'getCurrentDraft').mockRejectedValue(unavailable);
    const store = createAppStore();
    store.dispatch(signedIn(observer));
    await store.dispatch(loadAsteroidDateDraft());
    expect(store.getState().dates.draft).toMatchObject({ status: 'failed', source: null, data: null });
    store.dispatch(signedOut());
    load.mockClear();
    await store.dispatch(loadAsteroidDateDraft());
    expect(load).not.toHaveBeenCalled();
  });

  it('очищает фильтр при выходе и игнорирует ответ от предыдущей сессии', async () => {
    let serverFailed = () => {};
    vi.spyOn(asteroidDatesApi, 'listPublishedDates').mockImplementation(() => new Promise((_, reject) => {
      serverFailed = () => reject(unavailable);
    }));
    const store = createAppStore();
    store.dispatch(signedIn(observer));
    store.dispatch(maxMonthChanged(5));
    const pending = store.dispatch(loadPublishedAsteroidDates());
    store.dispatch(signedOut());
    serverFailed();
    await pending;
    expect(store.getState().auth).toMatchObject({ status: 0, observer: null });
    expect(store.getState().dates).toMatchObject({ filters: { maxMonth: 12 }, list: { status: 'idle', error: null } });
  });
});

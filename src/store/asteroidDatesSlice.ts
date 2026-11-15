import { createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_FILTERS } from '../lib/filters';
import type { AsteroidDate, DatesFilters } from '../types/date';
import { sessionExpired, signedIn, signedOut } from './authSlice';
import {
  deleteAsteroidDate, loadAsteroidDateDraft, loadAsteroidFeedDate, loadPublishedAsteroidDates,
  publishAsteroidDate, saveAsteroidDateDraft, setAsteroidDateLike, type DateSource,
} from './asteroidDatesThunks';

type RequestStatus = 'idle' | 'pending' | 'succeeded' | 'failed';
interface RequestState {
  status: RequestStatus;
  error: string | null;
  requestId: string | null;
}
interface DateResource<T> extends RequestState {
  data: T;
  source: DateSource | null;
}
interface AsteroidDatesState {
  filters: DatesFilters;
  list: DateResource<AsteroidDate[]>;
  feed: DateResource<AsteroidDate | null>;
  draft: DateResource<AsteroidDate | null>;
  mutation: RequestState;
}

const idle = (): RequestState => ({ status: 'idle', error: null, requestId: null });
const resource = <T>(data: T): DateResource<T> => ({ ...idle(), data, source: null });
const initialState = (): AsteroidDatesState => ({
  filters: { ...DEFAULT_FILTERS }, list: resource([]), feed: resource(null), draft: resource(null), mutation: idle(),
});
const start = (request: RequestState, requestId: string) => {
  Object.assign(request, { status: 'pending', error: null, requestId });
};
const finish = (request: RequestState) => { Object.assign(request, idle(), { status: 'succeeded' }); };
const fail = (request: RequestState, aborted: boolean, message?: string) => {
  Object.assign(request, idle(), aborted ? {} : { status: 'failed', error: message ?? 'Запрос не выполнен.' });
};

const asteroidDatesSlice = createSlice({
  name: 'dates',
  initialState,
  reducers: {
    maxMonthChanged(state, { payload }: PayloadAction<number>) { state.filters.maxMonth = payload; },
    clearDateActionError(state) { if (state.mutation.status === 'failed') state.mutation = idle(); },
  },
  extraReducers: builder => builder
    .addCase(signedIn, state => ({ ...initialState(), filters: state.filters }))
    .addCase(signedOut, initialState)
    .addCase(sessionExpired, initialState)
    .addCase(loadPublishedAsteroidDates.pending, (state, { meta }) => start(state.list, meta.requestId))
    .addCase(loadPublishedAsteroidDates.fulfilled, (state, { meta, payload }) => {
      if (state.list.requestId !== meta.requestId) return;
      Object.assign(state.list, payload);
      finish(state.list);
    })
    .addCase(loadPublishedAsteroidDates.rejected, (state, { meta, payload }) => {
      if (state.list.requestId === meta.requestId) fail(state.list, meta.aborted, payload);
    })
    .addCase(loadAsteroidFeedDate.pending, (state, { meta }) => start(state.feed, meta.requestId))
    .addCase(loadAsteroidFeedDate.fulfilled, (state, { meta, payload }) => {
      if (state.feed.requestId !== meta.requestId) return;
      Object.assign(state.feed, payload);
      finish(state.feed);
    })
    .addCase(loadAsteroidFeedDate.rejected, (state, { meta, payload }) => {
      if (state.feed.requestId === meta.requestId) fail(state.feed, meta.aborted, payload);
    })
    .addCase(loadAsteroidDateDraft.pending, (state, { meta }) => start(state.draft, meta.requestId))
    .addCase(loadAsteroidDateDraft.fulfilled, (state, { meta, payload }) => {
      if (state.draft.requestId !== meta.requestId) return;
      state.draft.data = payload;
      state.draft.source = 'backend';
      finish(state.draft);
    })
    .addCase(loadAsteroidDateDraft.rejected, (state, { meta, payload }) => {
      if (state.draft.requestId === meta.requestId) fail(state.draft, meta.aborted, payload);
    })
    .addCase(saveAsteroidDateDraft.fulfilled, (state, { meta, payload }) => {
      if (state.mutation.requestId !== meta.requestId) return;
      state.draft.data = payload;
      state.draft.source = 'backend';
      finish(state.mutation);
    })
    .addCase(publishAsteroidDate.fulfilled, (state, { meta }) => {
      if (state.mutation.requestId !== meta.requestId) return;
      state.draft.data = null;
      finish(state.mutation);
    })
    .addCase(deleteAsteroidDate.fulfilled, (state, { meta, payload }) => {
      if (state.mutation.requestId !== meta.requestId) return;
      state.list.data = state.list.data.filter(date => date.id !== payload);
      if (state.feed.data?.id === payload) state.feed = resource(null);
      finish(state.mutation);
    })
    .addCase(setAsteroidDateLike.fulfilled, (state, { meta, payload }) => {
      if (state.mutation.requestId !== meta.requestId) return;
      state.list.data = state.list.data.map(date => date.id === payload.id ? payload : date);
      if (state.feed.data?.id === payload.id) state.feed.data = payload;
      finish(state.mutation);
    })
    .addMatcher(isAnyOf(saveAsteroidDateDraft.pending, publishAsteroidDate.pending, deleteAsteroidDate.pending, setAsteroidDateLike.pending),
      (state, { meta }) => start(state.mutation, meta.requestId))
    .addMatcher(isAnyOf(saveAsteroidDateDraft.rejected, publishAsteroidDate.rejected, deleteAsteroidDate.rejected, setAsteroidDateLike.rejected),
      (state, { meta, payload }) => {
        if (state.mutation.requestId === meta.requestId) fail(state.mutation, meta.aborted, payload);
      }),
});

export const { maxMonthChanged, clearDateActionError } = asteroidDatesSlice.actions;
export const asteroidDatesReducer = asteroidDatesSlice.reducer;

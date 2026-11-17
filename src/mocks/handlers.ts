import { delay, http, HttpResponse } from 'msw';
import { filterDates, parseFilters } from '../lib/filters';
import { mockDates } from './dates';

const headers = { 'X-Data-Source': 'mock', 'Cache-Control': 'no-store' };

export const handlers = [
  http.get('/api/dates/feed', async ({ request }) => {
    await delay(120);
    const params = new URL(request.url).searchParams;
    const index = mockDates.findIndex(date => date.id === Number(params.get('id')));
    const next = params.get('next') === 'true';
    if (params.has('id') && index < 0 && !next) return HttpResponse.json({ data: null }, { headers });
    const date = next ? mockDates[(index + 1) % mockDates.length] : mockDates[Math.max(0, index)];
    return HttpResponse.json({ data: date }, { headers });
  }),
  http.get('/api/dates', async ({ request }) => {
    await delay(120);
    const filters = parseFilters(new URL(request.url).searchParams);
    return HttpResponse.json({ data: filterDates(mockDates, filters) }, { headers });
  }),
];

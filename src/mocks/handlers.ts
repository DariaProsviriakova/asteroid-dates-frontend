import { delay, http, HttpResponse } from 'msw';
import { filterDates, parseFilters } from '../lib/filters';
import { validateObserver } from '../lib/registration';
import { mockDates } from './dates';
import type { Observer, RegisterObserver } from '../types/observer';

const headers = { 'X-Data-Source': 'mock', 'Cache-Control': 'no-store' };
// Регистрация — отдельный mock-сценарий. Пароли и сессии не сохраняются.
const observers = new Map<string, Observer>();

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
  http.post('/api/users/register', async ({ request }) => {
    await delay(120);
    let body: unknown;
    try { body = await request.json(); }
    catch { return HttpResponse.json({ message: 'Некорректный JSON.' }, { status: 400, headers }); }
    if (!body || typeof body !== 'object') return HttpResponse.json({ message: 'Заполните поля регистрации.' }, { status: 400, headers });
    const payload = body as Record<string, unknown>;
    if (typeof payload.fullName !== 'string' || typeof payload.email !== 'string' || typeof payload.password !== 'string') {
      return HttpResponse.json({ message: 'Заполните имя, email и пароль.' }, { status: 400, headers });
    }
    const fields: RegisterObserver = { fullName: payload.fullName, email: payload.email, password: payload.password };
    const errors = validateObserver(fields);
    if (Object.keys(errors).length) return HttpResponse.json({ message: Object.values(errors).join(' ') }, { status: 400, headers });
    const email = fields.email.trim().toLowerCase();
    if (observers.has(email)) return HttpResponse.json({ message: 'Этот email уже зарегистрирован.' }, { status: 409, headers });
    const observer: Observer = { id: observers.size + 1, fullName: fields.fullName.trim(), email };
    observers.set(email, observer);
    return HttpResponse.json({ data: observer }, { status: 201, headers });
  }),
];

import { delay, http, HttpResponse } from 'msw';
import { filterDates, parseFilters } from '../lib/filters';
import { validateObserver } from '../lib/registration';
import { actor, getDemoState, passwordHash, publicDate, saveDemoState } from './store';
import type { AsteroidDate, DraftDate } from '../types/date';
import type { Observer, RegisterObserver } from '../types/observer';

const headers = { 'X-Data-Source': 'mock', 'Cache-Control': 'no-store' };
const ok = (data: unknown, status = 200) => HttpResponse.json({ data }, { status, headers });
const fail = (message: string, status = 400) => HttpResponse.json({ message }, { status, headers });

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const value: unknown = await request.json();
    return value && typeof value === 'object' ? value as Record<string, unknown> : null;
  } catch { return null; }
}

export const handlers = [
  http.get('/api/dates/feed', async ({ request }) => {
    await delay(120);
    const state = await getDemoState();
    const dates = [...state.dates].sort((a, b) => a.id - b.id);
    if (!dates.length) return ok(null);
    const params = new URL(request.url).searchParams;
    const index = dates.findIndex(date => date.id === Number(params.get('id')));
    if (params.has('id') && index < 0 && params.get('next') !== 'true') return ok(null);
    const date = params.get('next') === 'true' ? dates[(index + 1) % dates.length] : dates[Math.max(0, index)];
    return ok(publicDate(state, date));
  }),
  http.get('/api/dates/draft', async () => {
    const state = await getDemoState();
    return ok(state.draft);
  }),
  http.get('/api/dates', async ({ request }) => {
    await delay(120);
    const state = await getDemoState();
    const dates = filterDates(state.dates, parseFilters(new URL(request.url).searchParams))
      .sort((a, b) => a.approachMonth - b.approachMonth || a.approachDay - b.approachDay || a.id - b.id);
    return ok(dates.map(date => publicDate(state, date)));
  }),
  http.post('/api/dates', async ({ request }) => {
    await delay(120);
    const form = await request.formData();
    const designation = String(form.get('designation') ?? '').trim();
    if (!designation || designation.length > 120) return fail('Введите название астероида: от 1 до 120 символов.');
    const image = form.get('image');
    const video = form.get('video');
    if (image instanceof File && image.size && (!image.type.startsWith('image/') || image.size > 10 * 1024 * 1024)) return fail('Выберите изображение размером до 10 МБ.');
    if (video instanceof File && video.size && (!video.type.startsWith('video/') || video.size > 30 * 1024 * 1024)) return fail('Выберите видео размером до 30 МБ.');
    const state = await getDemoState();
    const draft: DraftDate = state.draft ?? {
      id: state.nextDateId++, designation, shortDescription: null, status: 'draft',
      imageUrl: null, videoUrl: null, approachMonth: 5, approachDay: 12, minimumDistanceAu: 0.023,
      likesCount: 0, creatorId: state.currentObserver?.id ?? 0, createdAt: new Date().toISOString(),
      formedAt: '', isCreator: 1, isLiked: 0,
    };
    draft.designation = designation;
    for (const [file, field] of [[image, 'imageUrl'], [video, 'videoUrl']] as const) {
      if (file instanceof File && file.size) {
        const key = crypto.randomUUID();
        state.media[key] = file;
        draft[field] = '/demo-media/' + key;
      }
    }
    state.draft = draft;
    await saveDemoState(state);
    return ok(draft, 201);
  }),
  http.put('/api/dates/publish', async ({ request }) => {
    await delay(120);
    const body = await readJson(request);
    if (!body) return fail('Заполните описание и дату сближения.');
    const description = typeof body.shortDescription === 'string' ? body.shortDescription.trim() : '';
    const month = Number(body.approachMonth);
    const day = Number(body.approachDay);
    if (!description || description.length > 700) return fail('Введите описание: от 1 до 700 символов.');
    if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(day) || day < 1 || day > new Date(2026, month, 0).getDate()) return fail('Укажите существующую дату сближения.');
    const state = await getDemoState();
    if (!state.draft) return fail('Сначала создайте черновик.', 404);
    const date: AsteroidDate = { ...state.draft, shortDescription: description, approachMonth: month, approachDay: day, status: 'published', formedAt: new Date().toISOString() };
    state.dates.push(date);
    state.draft = null;
    await saveDemoState(state);
    return ok(publicDate(state, date));
  }),
  http.delete('/api/dates/:id', async ({ params }) => {
    await delay(120);
    const state = await getDemoState();
    const id = Number(params.id);
    if (!state.dates.some(date => date.id === id)) return fail('Дата уже удалена или недоступна.', 404);
    state.dates = state.dates.filter(date => date.id !== id);
    await saveDemoState(state);
    return ok({ deletedId: id });
  }),
  http.post('/api/dates/:id/like', async ({ request, params }) => {
    const body = await readJson(request);
    if (body?.like !== 0 && body?.like !== 1) return fail('Значение like должно быть 0 или 1.');
    const state = await getDemoState();
    const date = state.dates.find(item => item.id === Number(params.id));
    if (!date) return fail('Дата недоступна.', 404);
    const key = actor(state);
    const likes = state.likes[key] ??= [];
    const exists = likes.includes(date.id);
    if (body.like === 1 && !exists) { likes.push(date.id); date.likesCount++; }
    if (body.like === 0 && exists) { state.likes[key] = likes.filter(id => id !== date.id); date.likesCount = Math.max(0, date.likesCount - 1); }
    await saveDemoState(state);
    return ok(publicDate(state, date));
  }),
  http.get('/demo-media/:key', async ({ params }) => {
    const state = await getDemoState();
    const file = state.media[String(params.key)];
    return file ? new HttpResponse(await file.arrayBuffer(), { headers: { 'Content-Type': file.type, 'Cache-Control': 'no-store' } }) : fail('Медиа не найдено.', 404);
  }),
  http.get('/api/users/session', async () => {
    const state = await getDemoState();
    return ok({ authenticated: state.currentObserver ? 1 : 0, observer: state.currentObserver });
  }),
  http.post('/api/users/register', async ({ request }) => {
    await delay(120);
    const body = await readJson(request);
    if (!body || typeof body.fullName !== 'string' || typeof body.email !== 'string' || typeof body.password !== 'string') return fail('Заполните имя, email и пароль.');
    const fields: RegisterObserver = { fullName: body.fullName, email: body.email, password: body.password };
    const errors = validateObserver(fields);
    if (Object.keys(errors).length) return fail(Object.values(errors).join(' '));
    const state = await getDemoState();
    const email = fields.email.trim().toLowerCase();
    if (state.users.some(user => user.observer.email === email)) return fail('Этот email уже зарегистрирован.', 409);
    const observer: Observer = { id: Math.max(10, ...state.users.map(user => user.observer.id)) + 1, fullName: fields.fullName.trim(), email };
    const salt = crypto.randomUUID();
    state.users.push({ observer, salt, passwordHash: await passwordHash(fields.password, salt) });
    await saveDemoState(state);
    return ok(observer, 201);
  }),
  http.post('/api/users/auth', async ({ request }) => {
    await delay(120);
    const body = await readJson(request);
    if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') return fail('Введите email и пароль.');
    const state = await getDemoState();
    const user = state.users.find(item => item.observer.email === String(body.email).trim().toLowerCase());
    if (!user || await passwordHash(body.password, user.salt) !== user.passwordHash) return fail('Неверный email или пароль.', 401);
    state.currentObserver = user.observer;
    await saveDemoState(state);
    return ok({ authenticated: 1, observer: user.observer });
  }),
  http.post('/api/users/logout', async () => {
    const state = await getDemoState();
    state.currentObserver = null;
    await saveDemoState(state);
    return ok({ authenticated: 0 });
  }),
];

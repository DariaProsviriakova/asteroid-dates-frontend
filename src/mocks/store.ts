import { mockDates } from './dates';
import type { AsteroidDate, DraftDate } from '../types/date';
import type { Observer } from '../types/observer';

interface DemoUser { observer: Observer; salt: string; passwordHash: string }
export interface DemoState {
  version: 1;
  dates: AsteroidDate[];
  draft: DraftDate | null;
  users: DemoUser[];
  currentObserver: Observer | null;
  likes: Record<string, number[]>;
  media: Record<string, Blob>;
  nextDateId: number;
}

// IndexedDB хранит только учебную копию данных в этом браузере, включая загруженные файлы.
const database = new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open('asteroid-dates-demo', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('demo');
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
database.catch(() => undefined);

export async function passwordHash(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100_000, hash: 'SHA-256' }, key, 256);
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
}

async function initialState(): Promise<DemoState> {
  const salt = crypto.randomUUID();
  return {
    version: 1, dates: structuredClone([...mockDates]), draft: null,
    users: [{ observer: { id: 1, fullName: 'Дарья', email: 'daria@example.com' }, salt, passwordHash: await passwordHash('AsteroidLab4!', salt) }],
    currentObserver: null, likes: {}, media: {}, nextDateId: 8,
  };
}

async function loadState(): Promise<DemoState> {
  try {
    const db = await database;
    const saved = await new Promise<DemoState | undefined>((resolve, reject) => {
      const request = db.transaction('demo', 'readonly').objectStore('demo').get('state');
      request.onsuccess = () => resolve(request.result as DemoState | undefined);
      request.onerror = () => reject(request.error);
    });
    if (saved?.version === 1) return saved;
  } catch { /* При запрете хранилища демо продолжает работать в памяти. */ }
  return initialState();
}

let statePromise: Promise<DemoState> | undefined;
export function getDemoState(): Promise<DemoState> { return statePromise ??= loadState(); }

export async function saveDemoState(state: DemoState): Promise<void> {
  try {
    const db = await database;
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('demo', 'readwrite');
      transaction.objectStore('demo').put(structuredClone(state), 'state');
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } catch { /* Память страницы остаётся рабочим запасным хранилищем. */ }
}

export function actor(state: DemoState): string { return state.currentObserver ? String(state.currentObserver.id) : 'guest'; }
export function publicDate(state: DemoState, date: AsteroidDate): AsteroidDate {
  return { ...date, isCreator: date.creatorId === (state.currentObserver?.id ?? 0) ? 1 : 0, isLiked: state.likes[actor(state)]?.includes(date.id) ? 1 : 0 };
}

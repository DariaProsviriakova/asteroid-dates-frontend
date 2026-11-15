import axios from 'axios';
import type { Observer } from '../types/observer';

const usersApi = axios.create({ baseURL: '/api/users', withCredentials: true, timeout: 10000 });
interface Envelope<T> { data: T }

export async function loginObserver(email: string, password: string): Promise<Observer> {
  const response = await usersApi.post<Envelope<{ authenticated: 1; observer: Observer }>>('/auth', {
    email: email.trim().toLowerCase(), password,
  });
  return response.data.data.observer;
}

export async function logoutObserver(): Promise<void> {
  await usersApi.post('/logout');
}

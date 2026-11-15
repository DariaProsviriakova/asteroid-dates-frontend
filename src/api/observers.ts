import axios from 'axios';
import type { Observer, RegisterObserver } from '../types/observer';

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

export async function registerObserver(fields: RegisterObserver): Promise<Observer> {
  const response = await usersApi.post<Envelope<Observer>>('/register', {
    fullName: fields.fullName.trim(), email: fields.email.trim().toLowerCase(), password: fields.password,
  });
  return response.data.data;
}

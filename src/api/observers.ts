import type { ApiResponse } from '../types/date';
import type { Observer, RegisterObserver } from '../types/observer';

export async function registerObserver(fields: RegisterObserver, signal: AbortSignal): Promise<Observer> {
  const response = await fetch('/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    signal,
    body: JSON.stringify({ fullName: fields.fullName.trim(), email: fields.email.trim().toLowerCase(), password: fields.password }),
  });
  const body = await response.json() as ApiResponse<Observer> & { message?: string };
  if (!response.ok) throw new Error(body.message ?? 'Не удалось зарегистрироваться. Попробуйте ещё раз.');
  return body.data;
}

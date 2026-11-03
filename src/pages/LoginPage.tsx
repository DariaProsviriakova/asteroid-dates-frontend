import { useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { jsonRequest } from '../api/request';
import { ErrorState, LoadingState } from '../components/ResourceState';
import { useDates } from '../hooks/useDates';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useRequest } from '../hooks/useRequest';
import type { Observer } from '../types/observer';

interface Session { authenticated: number; observer: Observer | null }

export function LoginPage() {
  useDocumentTitle('Вход');
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get('email') ?? '');
  const [password, setPassword] = useState('');
  const { data: session, loading, error: loadError, reload } = useDates<Session>('/api/users/session');
  const { run, pending, error } = useRequest();

  return <main className="form-page" id="main-content">
    <header className="page-header"><h1>{session?.observer ? 'АККАУНТ' : 'ВХОД'}</h1></header>
    {loading && <LoadingState />}
    {loadError && <ErrorState message={loadError} onRetry={reload} />}
    {!loading && session?.observer && <section className="registration-success">
      <h2>{session.observer.fullName}</h2><p>{session.observer.email}</p>
      <Link className="primary-button" to="/dates/add">Добавить дату</Link>
      <Button className="primary-button account-logout" disabled={pending} onClick={async () => {
        if (await run('/api/users/logout', { method: 'POST' })) reload();
      }}>{pending ? 'Выходим…' : 'Выйти'}</Button>
    </section>}
    {!loading && !loadError && !session?.observer && <Form className="registration-form" onSubmit={async event => {
      event.preventDefault();
      if (pending) return;
      if (await run<Session>('/api/users/auth', jsonRequest('POST', { email, password }))) { setPassword(''); reload(); }
    }}>
      <label className="field-block"><span>Email</span><input name="email" type="email" autoComplete="email" value={email} maxLength={120} required disabled={pending} onChange={event => setEmail(event.target.value)} /></label>
      <label className="field-block"><span>Пароль</span><input name="password" type="password" autoComplete="current-password" value={password} minLength={8} maxLength={128} required disabled={pending} onChange={event => setPassword(event.target.value)} /></label>
      <Button type="submit" className="primary-button" disabled={pending}>{pending ? 'Входим…' : 'Войти'}</Button>
      <Link className="back-link" to="/register">Зарегистрироваться</Link>
      <p className="registration-note">Демонстрационный вход:<br />daria@example.com<br />Пароль: AsteroidLab4!</p>
    </Form>}
    {error && <Alert variant="danger" className="action-error" role="alert">{error}</Alert>}
    <Link className="back-link" to="/dates">К выбору даты</Link>
  </main>;
}

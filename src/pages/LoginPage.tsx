import { useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { Navigate, useLocation } from 'react-router-dom';
import { apiErrorMessage, apiStatus } from '../api/errors';
import { loginObserver } from '../api/observers';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { clearAuthError, requestFailed, requestStarted, signedIn } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/store';

export function LoginPage() {
  useDocumentTitle('Вход');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { error, status } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const { state } = useLocation();
  const destination = state?.fromAdd ? '/dates/add' : '/dates';

  if (status === 'creator') return <Navigate to={destination} replace />;

  return <main className="form-page" id="main-content">
    <header className="page-header"><h1>ВХОД</h1></header>
    <p className="form-intro">Войдите, чтобы добавлять даты сближений и отмечать их лайком.</p>
    <Form className="observer-form" onSubmit={async event => {
      event.preventDefault();
      dispatch(requestStarted('login'));
      try {
        dispatch(signedIn(await loginObserver(email, password)));
      } catch (cause) {
        dispatch(requestFailed(apiStatus(cause) === 401 ? 'Неверный email или пароль.' : apiErrorMessage(cause, 'Не удалось войти.')));
      }
    }}>
      <Form.Group controlId="login-email" className="field-block">
        <Form.Label>Email</Form.Label>
        <Form.Control type="email" value={email} autoComplete="username" maxLength={120} required onChange={event => {
          setEmail(event.target.value);
          if (error) dispatch(clearAuthError());
        }} />
      </Form.Group>
      <Form.Group controlId="login-password" className="field-block">
        <Form.Label>Пароль</Form.Label>
        <Form.Control type="password" value={password} autoComplete="current-password" minLength={8} maxLength={128} required onChange={event => {
          setPassword(event.target.value);
          if (error) dispatch(clearAuthError());
        }} />
      </Form.Group>
      {error && <Alert variant="danger">{error}</Alert>}
      <Button type="submit" className="primary-button">Войти</Button>
    </Form>
  </main>;
}

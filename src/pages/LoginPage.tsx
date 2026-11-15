import { useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { Navigate, useLocation } from 'react-router-dom';
import { apiErrorMessage, apiStatus } from '../api/errors';
import { loginObserver } from '../api/observers';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { AUTH_STATUS, clearAuthError, requestFailed, requestStarted, signedIn } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/store';

export function LoginPage() {
  useDocumentTitle('Вход');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const { error, status } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const { state } = useLocation();
  const destination = state?.fromAdd ? '/dates/add' : '/dates';

  if (status === AUTH_STATUS.CREATOR) return <Navigate to={destination} replace />;

  return <main className="form-page" id="main-content">
    <header className="page-header"><h1>ВХОД</h1></header>
    <Form className="observer-form" onSubmit={async event => {
      event.preventDefault();
      dispatch(requestStarted('login'));
      try {
        dispatch(signedIn(await loginObserver(login, password)));
      } catch (cause) {
        dispatch(requestFailed(apiStatus(cause) === 401 ? 'Неверный логин или пароль.' : apiErrorMessage(cause, 'Не удалось войти.')));
      }
    }}>
      <Form.Group controlId="login-name" className="field-block">
        <Form.Label>Логин</Form.Label>
        <Form.Control type="text" value={login} autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={120} required onChange={event => {
          setLogin(event.target.value);
          if (error) dispatch(clearAuthError());
        }} />
      </Form.Group>
      <Form.Group controlId="login-password" className="field-block">
        <Form.Label>Пароль</Form.Label>
        <Form.Control type="password" value={password} autoComplete="current-password" maxLength={128} required onChange={event => {
          setPassword(event.target.value);
          if (error) dispatch(clearAuthError());
        }} />
      </Form.Group>
      {error && <Alert variant="danger">{error}</Alert>}
      <Button type="submit" className="primary-button">Войти</Button>
    </Form>
  </main>;
}

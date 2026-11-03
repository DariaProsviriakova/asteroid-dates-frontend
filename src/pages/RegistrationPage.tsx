import { useEffect, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { registerObserver } from '../api/observers';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { validateRegistration } from '../lib/registration';
import type { Observer, RegisterObserver, RegistrationErrors, RegistrationFields } from '../types/observer';

const EMPTY_FIELDS: RegistrationFields = { fullName: '', email: '', password: '', confirmPassword: '' };

export function RegistrationPage() {
  useDocumentTitle('Регистрация');
  const [fields, setFields] = useState({ ...EMPTY_FIELDS });
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [submission, setSubmission] = useState<RegisterObserver | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [observer, setObserver] = useState<Observer | null>(null);

  useEffect(() => {
    if (!submission) return;
    const controller = new AbortController();
    registerObserver(submission, controller.signal)
      .then(result => {
        if (!controller.signal.aborted) {
          setObserver(result);
          setFields({ ...EMPTY_FIELDS });
        }
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Нет соединения. Попробуйте ещё раз.');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setPending(false);
          setSubmission(null);
        }
      });
    return () => controller.abort();
  }, [submission]);

  const update = (name: keyof RegistrationFields, value: string) => {
    setFields(current => ({ ...current, [name]: value }));
    setErrors(current => ({ ...current, [name]: undefined }));
    setError(null);
  };

  return <main className="form-page" id="main-content">
    <header className="page-header"><h1>РЕГИСТРАЦИЯ</h1></header>
    {observer ? <section className="registration-success" role="status"><h2>Регистрация завершена</h2><p>{observer.fullName}</p></section> : <Form className="registration-form" noValidate onSubmit={event => {
      event.preventDefault();
      if (pending) return;
      const issues = validateRegistration(fields);
      setErrors(issues);
      if (Object.keys(issues).length) return;
      setError(null);
      setPending(true);
      setSubmission({ fullName: fields.fullName, email: fields.email, password: fields.password });
    }}>
      <Form.Group controlId="register-name"><Form.Label className="field-block"><span>Имя</span><Form.Control name="fullName" value={fields.fullName} autoComplete="name" maxLength={80} required disabled={pending} isInvalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'register-name-error' : undefined} onChange={event => update('fullName', event.target.value)} /><Form.Control.Feedback id="register-name-error" type="invalid">{errors.fullName}</Form.Control.Feedback></Form.Label></Form.Group>
      <Form.Group controlId="register-email"><Form.Label className="field-block"><span>Email</span><Form.Control name="email" type="email" value={fields.email} autoComplete="email" maxLength={120} required disabled={pending} isInvalid={Boolean(errors.email)} aria-describedby={errors.email ? 'register-email-error' : undefined} onChange={event => update('email', event.target.value)} /><Form.Control.Feedback id="register-email-error" type="invalid">{errors.email}</Form.Control.Feedback></Form.Label></Form.Group>
      <Form.Group controlId="register-password"><Form.Label className="field-block"><span>Пароль</span><Form.Control name="password" type="password" value={fields.password} autoComplete="new-password" minLength={8} maxLength={128} required disabled={pending} isInvalid={Boolean(errors.password)} aria-describedby={errors.password ? 'register-password-error' : undefined} onChange={event => update('password', event.target.value)} /><Form.Control.Feedback id="register-password-error" type="invalid">{errors.password}</Form.Control.Feedback></Form.Label></Form.Group>
      <Form.Group controlId="register-confirm"><Form.Label className="field-block"><span>Повторите пароль</span><Form.Control name="confirmPassword" type="password" value={fields.confirmPassword} autoComplete="new-password" maxLength={128} required disabled={pending} isInvalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 'register-confirm-error' : undefined} onChange={event => update('confirmPassword', event.target.value)} /><Form.Control.Feedback id="register-confirm-error" type="invalid">{errors.confirmPassword}</Form.Control.Feedback></Form.Label></Form.Group>
      {error && <Alert variant="danger" role="alert">{error}</Alert>}
      <Button type="submit" className="primary-button" disabled={pending}>{pending ? 'Регистрируем…' : 'Зарегистрироваться'}</Button>
    </Form>}
  </main>;
}

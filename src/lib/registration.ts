import type { RegisterObserver, RegistrationErrors, RegistrationFields } from '../types/observer';

/** Ограничения полей из RegisterUserDto бэкенда ЛР4. */
export function validateObserver(fields: RegisterObserver): RegistrationErrors {
  const errors: RegistrationErrors = {};
  if (!fields.fullName.trim() || fields.fullName.trim().length > 80) errors.fullName = 'Введите имя: от 1 до 80 символов.';
  if (fields.email.trim().length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) errors.email = 'Введите корректный email, не длиннее 120 символов.';
  if (fields.password.length < 8 || fields.password.length > 128) errors.password = 'Пароль должен содержать от 8 до 128 символов.';
  return errors;
}

export function validateRegistration(fields: RegistrationFields): RegistrationErrors {
  const errors = validateObserver(fields);
  if (fields.confirmPassword !== fields.password) errors.confirmPassword = 'Пароли не совпадают.';
  return errors;
}

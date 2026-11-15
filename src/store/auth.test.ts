import { expect, it } from 'vitest';
import { signedIn } from './authSlice';
import { createAppStore } from './store';

it('новый store после перезагрузки начинает с 0, независимо от входа в предыдущем store', () => {
  const observer = { id: 42, fullName: 'Наблюдатель', email: 'observer@example.test' };
  const beforeReload = createAppStore();
  beforeReload.dispatch(signedIn(observer));
  expect(beforeReload.getState().auth).toMatchObject({ status: 1, observer });

  const afterReload = createAppStore();
  expect(afterReload.getState().auth).toMatchObject({ status: 0, observer: null });
});

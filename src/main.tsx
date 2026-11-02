import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import { App } from './App';

async function start() {
  // Mock включён и при dev, и при preview production-сборки: бэкенд ЛР5 не нужен.
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest(request, print) {
      if (new URL(request.url).pathname.startsWith('/api/')) print.error();
    },
    quiet: true,
  });
  createRoot(document.getElementById('root')!).render(
    <StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>,
  );
}

start().catch(() => {
  const root = document.getElementById('root')!;
  root.innerHTML = '<main class="startup-error"><h1>Не удалось запустить каталог</h1><p>Разрешите Service Worker в браузере и откройте приложение через localhost.</p><button onclick="location.reload()">Повторить</button></main>';
});

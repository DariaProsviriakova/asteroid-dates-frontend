import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './backend.css';
import './styles.css';
import { App } from './App';
import { IS_PAGES } from './deployment';
import { store } from './store/store';

// ЛР5 регистрировала MSW на том же адресе. Старый worker иначе перехватит реальные GET.
async function retireMockWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;
  const workers = navigator.serviceWorker;
  const isMockWorker = (worker: ServiceWorker | null) => worker !== null &&
    new URL(worker.scriptURL).pathname === '/mockServiceWorker.js';
  const registration = await workers.getRegistration();
  if (!registration || ![registration.active, registration.waiting, registration.installing].some(isMockWorker)) return false;
  const needsReload = isMockWorker(workers.controller);
  return (await registration.unregister()) && needsReload;
}

async function start() {
  if (!IS_PAGES && await retireMockWorker().catch(() => false)) {
    window.location.reload();
    return;
  }
  if (IS_PAGES && 'serviceWorker' in navigator) {
    void navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(console.error);
  }
  const Router = IS_PAGES ? HashRouter : BrowserRouter;
  createRoot(document.getElementById('root')!).render(
    <StrictMode><Provider store={store}><Router><App /></Router></Provider></StrictMode>,
  );
}

void start();

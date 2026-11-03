import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';

test('сохранён визуал бэкенда: узкая область, два столбца и прежние цвета', async ({ page }) => {
  await page.goto('/dates');
  await expect(page.locator('.asteroid-card')).toHaveCount(6);
  const metrics = await page.evaluate(() => {
    const shell = document.querySelector('.app-shell')!;
    const grid = document.querySelector('.dates-grid')!;
    const nav = document.querySelector('.tab-bar')!;
    const cards = grid.querySelectorAll('.asteroid-card');
    return {
      width: shell.getBoundingClientRect().width,
      viewport: innerWidth,
      columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
      background: getComputedStyle(document.body).backgroundColor,
      ink: getComputedStyle(document.body).color,
      navColor: getComputedStyle(nav).backgroundColor,
      sameRow: cards[0].getBoundingClientRect().top === cards[1].getBoundingClientRect().top,
    };
  });
  expect(metrics.width).toBe(Math.min(metrics.viewport, 498));
  expect(metrics.columns).toBe(2);
  expect(metrics.sameRow).toBe(true);
  expect(metrics.background).toBe('rgb(31, 31, 31)');
  expect(metrics.ink).toBe('rgb(21, 63, 140)');
  expect(metrics.navColor).toBe('rgb(0, 75, 97)');
  await expect(page.getByRole('heading', { name: 'ВЫБОР ДАТЫ' })).toBeVisible();
  await expect(page.locator('.catalog-hero')).toHaveCount(0);
});

test('mock-ответы видны в Network; все четыре вкладки доступны', async ({ page }) => {
  const responsePromise = page.waitForResponse(response => response.url().endsWith('/api/dates'));
  await page.goto('/dates');
  const response = await responsePromise;
  expect(response.status()).toBe(200);
  expect(response.fromServiceWorker()).toBe(true);
  expect(response.headers()['x-data-source']).toBe('mock');
  await expect(page.locator('.asteroid-card')).toHaveCount(6);
  const nav = page.getByRole('navigation', { name: 'Основная навигация' });
  await expect(nav.getByRole('link')).toHaveCount(4);
  await expect(page.getByRole('button', { name: 'Удалить 2026 KJ', exact: true })).toBeEnabled();
  await page.getByRole('link', { name: 'Открыть ленту для 2026 KJ', exact: true }).click();
  await expect(page.locator('.feed-designation')).toHaveText('2026 KJ');
  await expect(page.getByRole('heading', { name: 'МИНИМАЛЬНОЕ РАССТОЯНИЕ ДО ЗЕМЛИ' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Лента', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('фильтр месяца, обновление страницы и история браузера', async ({ page }) => {
  await page.goto('/dates');
  await expect(page.locator('.asteroid-card')).toHaveCount(6);
  const slider = page.getByRole('slider');
  await slider.press('Home');
  for (let i = 0; i < 4; i++) await slider.press('ArrowRight');
  await expect(slider).toHaveValue('5');
  await page.getByRole('button', { name: 'Показать', exact: true }).click();
  await expect(page.locator('.asteroid-card')).toHaveCount(2);
  await expect(page).toHaveURL(/maxMonth=5/);
  await page.reload();
  await expect(page.locator('.asteroid-card')).toHaveCount(2);
  await expect(slider).toHaveValue('5');
  await slider.press('ArrowRight');
  await page.getByRole('button', { name: 'Показать', exact: true }).click();
  await expect(page.locator('.asteroid-card')).toHaveCount(4);
  await page.goBack();
  await expect(page.locator('.asteroid-card')).toHaveCount(2);
  await expect(slider).toHaveValue('5');
});

test('пустой результат и возврат ко всем датам', async ({ page }) => {
  await page.goto('/dates?maxMonth=1');
  await expect(page.getByText('До месяца 1 ничего не найдено.')).toBeVisible();
  await page.getByRole('button', { name: 'Сбросить фильтр' }).click();
  await expect(page.locator('.asteroid-card')).toHaveCount(6);
});

test('локальные изображение и видео по умолчанию', async ({ page }) => {
  await page.goto('/dates');
  const image = page.locator('.asteroid-card[data-date-id="5"] img');
  await expect(image).toHaveAttribute('src', '/media/default-date.png');
  await expect(image).toHaveAttribute('data-default', 'true');
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
  await page.getByRole('link', { name: 'Открыть ленту для 2026 JD4', exact: true }).click();
  const video = page.locator('.feed-page video');
  await expect(video).toHaveAttribute('src', '/media/default-date.mp4');
  await expect(video).toHaveAttribute('data-default', 'true');
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('лента переключается по кругу; описание раскрывается', async ({ page }) => {
  await page.goto('/dates/feed/7');
  await expect(page.locator('.feed-designation')).toHaveText('2026 KL2');
  await page.locator('.feed-description summary').click();
  await expect(page.locator('.feed-description')).toHaveAttribute('open', '');
  await page.getByRole('button', { name: 'Следующая дата' }).click();
  await expect(page.locator('.feed-designation')).toHaveText('2026 KJ');
  await expect(page.locator('.feed-description')).not.toHaveAttribute('open', '');
  await page.getByRole('button', { name: 'Следующая дата' }).click();
  await expect(page.locator('.feed-designation')).toHaveText('2026 KK3');
});

test('регистрация: проверки полей и успешный mock POST без пароля в ответе', async ({ page }) => {
  await page.goto('/dates');
  await page.getByRole('link', { name: 'Регистрация', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'РЕГИСТРАЦИЯ' })).toBeVisible();
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
  await expect(page.getByText('Введите имя: от 1 до 80 символов.')).toBeVisible();
  await page.locator('#register-name').fill('Новый наблюдатель');
  await page.locator('#register-email').fill('New.Observer@example.com');
  await page.locator('#register-password').fill('Asteroids2026!');
  await page.locator('#register-confirm').fill('Different2026!');
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
  await expect(page.getByText('Пароли не совпадают.')).toBeVisible();
  await page.locator('#register-confirm').fill('Asteroids2026!');
  const responsePromise = page.waitForResponse(response => response.url().endsWith('/api/users/register'));
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
  const response = await responsePromise;
  expect(response.status()).toBe(201);
  expect(response.fromServiceWorker()).toBe(true);
  expect(response.headers()['x-data-source']).toBe('mock');
  const body = await response.json();
  expect(body.data).toMatchObject({ fullName: 'Новый наблюдатель', email: 'new.observer@example.com' });
  expect(body.data).not.toHaveProperty('password');
  await expect(page.getByRole('heading', { name: 'Регистрация завершена' })).toBeVisible();
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  await page.getByRole('link', { name: 'К выбору даты' }).click();
  await expect(page.locator('.asteroid-card')).toHaveCount(6);
});

test('регистрация показывает конфликт email и проверяет поля на mock-сервисе', async ({ page }) => {
  await page.goto('/register');
  await page.locator('#register-name').fill('Дарья');
  await page.locator('#register-email').fill('daria@example.com');
  await page.locator('#register-password').fill('Asteroids2026!');
  await page.locator('#register-confirm').fill('Asteroids2026!');
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
  await expect(page.getByRole('alert')).toContainText('Этот email уже зарегистрирован.');
  const status = await page.evaluate(async () => {
    const response = await fetch('/api/users/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: '', email: 'bad', password: '123' }),
    });
    return response.status;
  });
  expect(status).toBe(400);
});

test('неизвестная дата и неизвестный путь показывают 404', async ({ page }) => {
  await page.goto('/dates/feed/999');
  await expect(page.getByRole('heading', { name: 'Эта дата не найдена' })).toBeVisible();
  await page.getByRole('link', { name: 'К выбору даты' }).click();
  await expect(page.locator('.asteroid-card')).toHaveCount(6);
  await page.goto('/unknown');
  await expect(page.getByRole('heading', { name: 'Эта дата не найдена' })).toBeVisible();
});

test('полоска под каждой активной вкладкой расположена как в ЛР2', async ({ page }) => {
  await page.goto('/dates');
  const nav = page.getByRole('navigation', { name: 'Основная навигация' });
  for (const label of ['Лента', 'Добавление', 'Плитка', 'Вход']) {
    const link = nav.getByRole('link', { name: label, exact: true });
    await link.click();
    await expect(link).toHaveClass(/active/);
    await expect(nav.locator('.active')).toHaveCount(1);
    const style = await link.evaluate(element => {
      const bar = getComputedStyle(element, '::after');
      return { height: element.getBoundingClientRect().height, bottom: bar.bottom, width: bar.width, barHeight: bar.height, background: bar.backgroundColor };
    });
    expect(style).toEqual({ height: 76, bottom: '16px', width: '48px', barHeight: '3px', background: 'rgb(255, 255, 255)' });
  }
  await page.getByRole('link', { name: 'Зарегистрироваться', exact: true }).click();
  await expect(nav.getByRole('link', { name: 'Вход', exact: true })).toHaveClass(/active/);
  await page.goto('/dates/5');
  await expect(nav.getByRole('link', { name: 'Лента', exact: true })).toHaveClass(/active/);
});

test('крестик прежнего вида удаляет дату; удаление переживает обновление', async ({ page }) => {
  await page.goto('/dates');
  await expect(page.locator('.asteroid-card')).toHaveCount(6);
  const cross = page.getByRole('button', { name: 'Удалить 2026 KJ', exact: true });
  const style = await cross.evaluate(element => {
    const computed = getComputedStyle(element);
    return { width: computed.width, height: computed.height, borderRadius: computed.borderRadius, color: computed.color, background: computed.backgroundColor, fontSize: computed.fontSize, opacity: computed.opacity };
  });
  expect(style).toEqual({ width: '32px', height: '32px', borderRadius: '50%', color: 'rgb(21, 63, 140)', background: 'rgb(255, 255, 255)', fontSize: '24px', opacity: '1' });
  await cross.click();
  await expect(page.locator('.asteroid-card')).toHaveCount(5);
  await page.reload();
  await expect(page.locator('.asteroid-card')).toHaveCount(5);
  await expect(page.getByRole('link', { name: 'Открыть ленту для 2026 KJ', exact: true })).toHaveCount(0);
  for (let count = 5; count > 0; count--) {
    await page.getByRole('button', { name: /^Удалить / }).first().click();
    await expect(page.locator('.asteroid-card')).toHaveCount(count - 1);
  }
  await expect(page.getByText('Дат пока нет. Добавьте первое наблюдение.')).toBeVisible();
  await page.getByRole('link', { name: 'Лента', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Добавить дату', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Добавить дату', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'ДОБАВЛЕНИЕ', exact: true })).toBeVisible();
});

test('лайк работает в плитке и ленте и сохраняется при обновлении', async ({ page }) => {
  await page.goto('/dates');
  const card = page.locator('.asteroid-card[data-date-id="2"]');
  const like = card.getByRole('button', { name: 'Нравится 2026 KJ' });
  await like.click();
  await expect(like).toHaveAttribute('aria-pressed', 'true');
  await expect(card.locator('.card-like > span').last()).toHaveText('6');
  await card.getByRole('link', { name: 'Открыть ленту для 2026 KJ', exact: true }).click();
  await expect(page.locator('.like-count')).toHaveText('6');
  await page.getByRole('button', { name: 'Нравится 2026 KJ' }).click();
  await expect(page.locator('.like-count')).toHaveText('5');
  await page.reload();
  await expect(page.locator('.like-count')).toHaveText('5');
});

test('регистрация, вход с созданным паролем, обновление и выход', async ({ page }) => {
  await page.goto('/register');
  await page.locator('#register-name').fill('Наблюдатель');
  await page.locator('#register-email').fill('observer@example.com');
  await page.locator('#register-password').fill('Asteroids2026!');
  await page.locator('#register-confirm').fill('Asteroids2026!');
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
  await page.getByRole('link', { name: 'Войти', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toHaveValue('observer@example.com');
  await page.getByLabel('Пароль', { exact: true }).fill('Bad2026!');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Неверный email или пароль.');
  await page.getByLabel('Пароль', { exact: true }).fill('Asteroids2026!');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'АККАУНТ', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Наблюдатель', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Выйти', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Войти', exact: true })).toBeVisible();
});

test('добавление в два шага, проверка даты, публикация и удаление', async ({ page }) => {
  await page.goto('/dates/add');
  await page.getByLabel('Название астероида', { exact: true }).fill('2026 TEST');
  await page.getByRole('button', { name: 'Далее', exact: true }).click();
  await expect(page.locator('.draft-name')).toHaveText('2026 TEST');
  await page.getByLabel('Описание', { exact: true }).fill('Проверка публикации новой даты.');
  await page.getByLabel('Месяц сближения', { exact: true }).fill('2');
  await page.getByLabel('День сближения', { exact: true }).fill('31');
  await page.getByRole('button', { name: 'Опубликовать', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Укажите существующую дату сближения.');
  await page.getByLabel('День сближения', { exact: true }).fill('28');
  await page.getByRole('button', { name: 'Опубликовать', exact: true }).click();
  await expect(page.locator('.feed-designation')).toHaveText('2026 TEST');
  await expect(page.locator('.feed-params')).toContainText('28 февраля 2026');
  await page.getByRole('link', { name: 'Плитка', exact: true }).click();
  await expect(page.locator('.asteroid-card')).toHaveCount(7);
  await page.getByRole('button', { name: 'Удалить 2026 TEST', exact: true }).click();
  await expect(page.locator('.asteroid-card')).toHaveCount(6);
});

test('загруженные фото и видео сохраняются в черновике и после публикации', async ({ page }) => {
  await page.goto('/dates/add');
  await page.getByLabel('Название астероида', { exact: true }).fill('2026 MEDIA');
  await page.getByLabel('Выбрать фото', { exact: true }).setInputFiles(fileURLToPath(new URL('../public/media/asteroid-day-15.png', import.meta.url)));
  await page.getByLabel('Выбрать видео', { exact: true }).setInputFiles(fileURLToPath(new URL('../public/media/asteroid-day-15.mp4', import.meta.url)));
  await page.getByRole('button', { name: 'Далее', exact: true }).click();
  await expect(page.locator('.draft-name')).toHaveText('2026 MEDIA');
  await page.reload();
  await expect(page.locator('.draft-name')).toHaveText('2026 MEDIA');
  await page.getByLabel('Описание', { exact: true }).fill('Наблюдение с загруженными медиа.');
  await page.getByRole('button', { name: 'Опубликовать', exact: true }).click();
  await expect(page.locator('.feed-designation')).toHaveText('2026 MEDIA');
  const video = page.locator('.feed-page video');
  await expect(video).toHaveAttribute('src', /\/demo-media\//);
  await page.reload();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState)).toBeGreaterThan(0);
  await page.getByRole('link', { name: 'Плитка', exact: true }).click();
  const image = page.getByRole('img', { name: '2026 MEDIA', exact: true });
  await expect(image).toHaveAttribute('src', /\/demo-media\//);
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
});

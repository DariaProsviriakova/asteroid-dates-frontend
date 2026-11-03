import { expect, test } from '@playwright/test';

test('визуал ЛР2: прежние размеры, цвета, два столбца и шкала месяца', async ({ page }) => {
  await page.goto('/dates');
  await expect(page.locator('.asteroid-card')).toHaveCount(6);
  const metrics = await page.evaluate(() => {
    const shell = document.querySelector('.app-shell')!;
    const grid = document.querySelector('.dates-grid')!;
    const nav = document.querySelector('.tab-bar')!;
    const labels = document.querySelectorAll('.range-labels span');
    const cards = grid.querySelectorAll('.asteroid-card');
    return {
      width: shell.getBoundingClientRect().width, viewport: innerWidth,
      columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
      background: getComputedStyle(document.body).backgroundColor,
      ink: getComputedStyle(document.body).color, navColor: getComputedStyle(nav).backgroundColor,
      sameRow: cards[0].getBoundingClientRect().top === cards[1].getBoundingClientRect().top,
      marks: labels.length, markSize: getComputedStyle(labels[0]).fontSize,
    };
  });
  expect(metrics.width).toBe(Math.min(metrics.viewport, 498));
  expect(metrics.columns).toBe(2);
  expect(metrics.sameRow).toBe(true);
  expect(metrics.background).toBe('rgb(31, 31, 31)');
  expect(metrics.ink).toBe('rgb(21, 63, 140)');
  expect(metrics.navColor).toBe('rgb(0, 75, 97)');
  expect(metrics.marks).toBe(12);
  expect(metrics.markSize).toBe('16px');
  await expect(page.getByRole('heading', { name: 'ВЫБОР ДАТЫ' })).toBeVisible();
  await expect(page.locator('.catalog-hero')).toHaveCount(0);
});

test('navbar: ровно четыре пункта и только два доступны гостю', async ({ page }) => {
  await page.goto('/dates');
  const nav = page.getByRole('navigation', { name: 'Основная навигация' });
  await expect(nav.locator('.tab-link')).toHaveCount(4);
  await expect(nav.getByRole('link')).toHaveCount(2);
  await expect(nav.getByRole('button', { name: 'Добавление', exact: true })).toBeDisabled();
  await expect(nav.getByRole('button', { name: 'Вход', exact: true })).toBeDisabled();
  await expect(nav.getByRole('button', { name: 'Добавление', exact: true })).not.toHaveAttribute('href');
  await expect(nav.getByRole('button', { name: 'Вход', exact: true })).not.toHaveAttribute('href');
  await nav.getByRole('link', { name: 'Лента', exact: true }).click();
  await expect(page.locator('.feed-designation')).toHaveText('2026 KJ');
  await nav.getByRole('link', { name: 'Плитка', exact: true }).click();
  await expect(page.locator('.asteroid-card')).toHaveCount(6);
});

test('добавление и вход недоступны также по прямому адресу', async ({ page }) => {
  for (const route of ['/dates/add', '/login']) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/dates$/);
    await expect(page.locator('.asteroid-card')).toHaveCount(6);
    await expect(page.locator('input[type="password"], input[type="file"]')).toHaveCount(0);
  }
});

test('плитка и лента получают только mock-ответы через Network', async ({ page }) => {
  const responsePromise = page.waitForResponse(response => response.url().endsWith('/api/dates'));
  await page.goto('/dates');
  const response = await responsePromise;
  expect(response.status()).toBe(200);
  expect(response.fromServiceWorker()).toBe(true);
  expect(response.headers()['x-data-source']).toBe('mock');
  const body = await response.json();
  expect(body.data).toHaveLength(6);
  expect(body.data.every((date: { isCreator: number; isLiked: number }) => date.isCreator === 0 && date.isLiked === 0)).toBe(true);
  await page.getByRole('link', { name: 'Открыть ленту для 2026 KJ', exact: true }).click();
  await expect(page.locator('.feed-designation')).toHaveText('2026 KJ');
  await expect(page.getByRole('heading', { name: 'МИНИМАЛЬНОЕ РАССТОЯНИЕ ДО ЗЕМЛИ' })).toBeVisible();
});

test('фильтр месяца: черновик, применение, обновление и история', async ({ page }) => {
  await page.goto('/dates');
  await expect(page.locator('.asteroid-card')).toHaveCount(6);
  const slider = page.getByRole('slider');
  await slider.press('Home');
  for (let i = 0; i < 4; i++) await slider.press('ArrowRight');
  await expect(slider).toHaveValue('5');
  await expect(page.locator('.asteroid-card')).toHaveCount(6);
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

test('пустая выдача и сброс фильтра', async ({ page }) => {
  await page.goto('/dates?maxMonth=1');
  await expect(page.getByText('До месяца 1 ничего не найдено.')).toBeVisible();
  await page.getByRole('button', { name: 'Сбросить фильтр' }).click();
  await expect(page.locator('.asteroid-card')).toHaveCount(6);
});

test('изображение и видео по умолчанию при null и пустой строке', async ({ page }) => {
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
  await page.goto('/dates/feed/6');
  await expect(page.locator('.feed-page video')).toHaveAttribute('src', '/media/default-date.mp4');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('лента: циклическое переключение и раскрытие описания', async ({ page }) => {
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

test('третья страница: регистрация без удалённых подсказок и ссылок', async ({ page }) => {
  await page.goto('/dates');
  await page.getByRole('link', { name: 'Регистрация', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'РЕГИСТРАЦИЯ' })).toBeVisible();
  for (const text of ['Демонстрационный вход:', 'daria@example.com', 'AsteroidLab4!', 'К выбору даты', 'От 8 до 128 символов.', 'Учебный аккаунт сохраняется в этом браузере.']) {
    await expect(page.getByText(text, { exact: false })).toHaveCount(0);
  }
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
  await expect(page.getByRole('link', { name: 'Войти', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Вход', exact: true })).toBeDisabled();
  await page.getByRole('link', { name: 'Плитка', exact: true }).click();
  await expect(page.locator('.asteroid-card')).toHaveCount(6);
});

test('mock-регистрация: повторный email и неверные поля', async ({ page }) => {
  await page.goto('/register');
  await expect(page.getByRole('heading', { name: 'РЕГИСТРАЦИЯ', exact: true })).toBeVisible();
  const created = await page.evaluate(async () => {
    const response = await fetch('/api/users/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Наблюдатель', email: 'observer@example.com', password: 'Asteroids2026!' }),
    });
    return response.status;
  });
  expect(created).toBe(201);
  await page.locator('#register-name').fill('Наблюдатель');
  await page.locator('#register-email').fill('observer@example.com');
  await page.locator('#register-password').fill('Asteroids2026!');
  await page.locator('#register-confirm').fill('Asteroids2026!');
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
  await expect(page.getByRole('alert')).toContainText('Этот email уже зарегистрирован.');
  const invalid = await page.evaluate(async () => {
    const response = await fetch('/api/users/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: '', email: 'bad', password: '123' }),
    });
    return response.status;
  });
  expect(invalid).toBe(400);
});

test('полоска остаётся под текстом только доступной активной вкладки', async ({ page }) => {
  await page.goto('/dates');
  const nav = page.getByRole('navigation', { name: 'Основная навигация' });
  for (const label of ['Лента', 'Плитка']) {
    const link = nav.getByRole('link', { name: label, exact: true });
    await link.click();
    await expect(nav.locator('.active')).toHaveCount(1);
    const style = await link.evaluate(element => {
      const bar = getComputedStyle(element, '::after');
      return { height: element.getBoundingClientRect().height, bottom: bar.bottom, width: bar.width, barHeight: bar.height, background: bar.backgroundColor };
    });
    expect(style).toEqual({ height: 76, bottom: '16px', width: '48px', barHeight: '3px', background: 'rgb(255, 255, 255)' });
  }
  for (const label of ['Добавление', 'Вход']) {
    const disabled = nav.getByRole('button', { name: label, exact: true });
    await disabled.scrollIntoViewIfNeeded();
    const box = await disabled.boundingBox();
    if (!box) throw new Error('Пункт navbar не отображается.');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    expect(await disabled.evaluate(element => getComputedStyle(element, '::after').backgroundColor)).toBe('rgba(0, 0, 0, 0)');
  }
  await page.goto('/dates/5');
  await expect(nav.getByRole('link', { name: 'Лента', exact: true })).toHaveClass(/active/);
});

test('гость не изменяет карточки; крестик сохраняет исходный вид', async ({ page }) => {
  await page.goto('/dates');
  await expect(page.locator('.asteroid-card')).toHaveCount(6);
  const cross = page.getByRole('button', { name: 'Удалить 2026 KJ', exact: true });
  await expect(cross).toBeDisabled();
  const style = await cross.evaluate(element => {
    const computed = getComputedStyle(element);
    return { width: computed.width, height: computed.height, borderRadius: computed.borderRadius, color: computed.color, background: computed.backgroundColor, fontSize: computed.fontSize, opacity: computed.opacity };
  });
  expect(style).toEqual({ width: '32px', height: '32px', borderRadius: '50%', color: 'rgb(21, 63, 140)', background: 'rgb(255, 255, 255)', fontSize: '24px', opacity: '1' });
  await expect(page.getByRole('button', { name: /^Нравится / })).toHaveCount(0);
  await cross.evaluate((element: HTMLButtonElement) => element.click());
  await page.reload();
  await expect(page.locator('.asteroid-card')).toHaveCount(6);
});

test('404 без удалённой ссылки; возврат через navbar', async ({ page }) => {
  for (const route of ['/dates/feed/999', '/unknown']) {
    await page.goto(route);
    await expect(page.getByRole('heading', { name: 'Эта дата не найдена' })).toBeVisible();
    await expect(page.getByText('К выбору даты', { exact: true })).toHaveCount(0);
    await page.getByRole('link', { name: 'Плитка', exact: true }).click();
    await expect(page.locator('.asteroid-card')).toHaveCount(6);
  }
});

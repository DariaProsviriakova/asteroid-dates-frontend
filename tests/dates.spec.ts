import { expect, test } from '@playwright/test';

test('три страницы получают mock-данные; в navbar доступны два пункта', async ({ page }) => {
  const responsePromise = page.waitForResponse(response => response.url().endsWith('/api/dates'));
  await page.goto('/dates');
  const response = await responsePromise;
  expect(response.status()).toBe(200);
  expect(response.fromServiceWorker()).toBe(true);
  expect(response.headers()['x-data-source']).toBe('mock');
  await expect(page.locator('.date-card')).toHaveCount(6);
  const nav = page.getByRole('navigation', { name: 'Основная навигация' });
  await expect(nav.getByRole('link')).toHaveCount(2);
  await expect(nav.getByRole('button', { name: 'Добавление' })).toBeDisabled();
  await expect(nav.getByRole('button', { name: 'Вход' })).toBeDisabled();
  await page.getByRole('link', { name: 'Подробнее о 2026 KJ', exact: true }).click();
  await expect(page.getByRole('heading', { name: '2026 KJ', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Смотреть в ленте' }).click();
  await expect(page.locator('.feed-main h2')).toHaveText('2026 KJ');
  await expect(nav.getByRole('link', { name: 'Лента', exact: true })).toHaveAttribute('aria-current', 'page');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('месяц, поиск и сброс фильтра; URL переживает обновление страницы', async ({ page }) => {
  await page.goto('/dates');
  await expect(page.locator('.date-card')).toHaveCount(6);
  const slider = page.getByRole('slider');
  await slider.press('Home');
  for (let i = 0; i < 4; i++) await slider.press('ArrowRight');
  await expect(slider).toHaveValue('5');
  await page.getByRole('button', { name: 'Показать', exact: true }).click();
  await expect(page.locator('.date-card')).toHaveCount(2);
  await expect(page).toHaveURL(/maxMonth=5/);
  await page.reload();
  await expect(page.locator('.date-card')).toHaveCount(2);
  await expect(slider).toHaveValue('5');
  await page.getByLabel('Название астероида').fill('kk3');
  await page.getByRole('button', { name: 'Показать', exact: true }).click();
  await expect(page.locator('.date-card')).toHaveCount(1);
  await expect(page.locator('.date-card h3')).toHaveText('2026 KK3');
  await page.getByRole('button', { name: 'Сбросить', exact: true }).click();
  await expect(page.locator('.date-card')).toHaveCount(6);
  await expect(slider).toHaveValue('12');
});

test('пустой результат и сортировка по расстоянию', async ({ page }) => {
  await page.goto('/dates?maxMonth=1');
  await expect(page.getByRole('heading', { name: 'Таких дат пока нет' })).toBeVisible();
  await page.getByRole('button', { name: 'Сбросить фильтры' }).click();
  await expect(page.locator('.date-card')).toHaveCount(6);
  await page.getByLabel('Порядок').selectOption('distance');
  await page.getByRole('button', { name: 'Показать', exact: true }).click();
  await expect(page.locator('.date-card h3').first()).toHaveText('2026 KL2');
});

test('изображение и видео по умолчанию доступны из самого проекта', async ({ page }) => {
  await page.goto('/dates/5');
  await expect(page.getByRole('heading', { name: '2026 JD4', exact: true })).toBeVisible();
  const image = page.locator('.detail-image-wrap img');
  await expect(image).toHaveAttribute('src', '/media/default-date.png');
  await expect(image).toHaveAttribute('data-default', 'true');
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByRole('status')).toContainText('по умолчанию');
  await page.getByRole('button', { name: 'Видео', exact: true }).click();
  const video = page.locator('.detail-image-wrap video');
  await expect(video).toHaveAttribute('src', '/media/default-date.mp4');
  await expect(video).toHaveAttribute('data-default', 'true');
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState)).toBeGreaterThan(0);
  await expect(page.getByRole('status')).toContainText('Видео не добавлено');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('следующая дата в ленте и возврат к первой после последней', async ({ page }) => {
  await page.goto('/feed?id=7');
  await expect(page.locator('.feed-main h2')).toHaveText('2026 KL2');
  await page.getByRole('button', { name: 'Следующая дата' }).click();
  await expect(page.locator('.feed-main h2')).toHaveText('2026 KJ');
  await page.getByRole('button', { name: 'Следующая дата' }).click();
  await expect(page.locator('.feed-main h2')).toHaveText('2026 KK3');
});

test('неизвестная карточка и неизвестный маршрут показывают 404', async ({ page }) => {
  await page.goto('/dates/999');
  await expect(page.getByRole('heading', { name: 'Эта дата не найдена' })).toBeVisible();
  await page.getByRole('link', { name: 'К датам сближений' }).click();
  await expect(page.locator('.date-card')).toHaveCount(6);
  await page.goto('/unknown');
  await expect(page.getByRole('heading', { name: 'Эта дата не найдена' })).toBeVisible();
});

import { expect, test } from '@playwright/test';

test('loads ambient canvas, overlay, and controls without console errors', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.goto('/');
  await expect(page.getByRole('main', { name: /flower of life visualizer/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /enable mic \+ camera/i })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.locator('.fol-gui')).toBeVisible();

  const canvasSize = await page.locator('canvas').evaluate((canvas) => ({
    width: canvas.width,
    height: canvas.height,
  }));

  expect(canvasSize.width).toBeGreaterThan(0);
  expect(canvasSize.height).toBeGreaterThan(0);
  expect(consoleErrors).toEqual([]);
});

test('permission denial stays in ambient mode without page errors', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: () => Promise.reject(new DOMException('denied by test', 'NotAllowedError')),
      },
      configurable: true,
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /enable mic \+ camera/i }).click();
  await expect(page.getByRole('button', { name: /try permissions again/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /running in ambient mode/i })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

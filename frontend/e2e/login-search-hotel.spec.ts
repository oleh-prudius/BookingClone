import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin@bookingclone.dev';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'Admin@123456';

test('login, search hotels, and open a hotel', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('Email or username').fill(ADMIN_EMAIL);
  await page.getByPlaceholder('Password').fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"]', { hasText: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/hotels$/);
  await expect(page.getByRole('button', { name: 'Details' }).first()).toBeVisible({ timeout: 15000 });

  await page.getByRole('button', { name: 'Details' }).first().click();

  await expect(page).toHaveURL(/\/hotels\/\d+$/);
});

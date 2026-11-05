
import { test, expect } from '@playwright/test';

test.describe('FlashGuard - Payment Method Management', () => {

  test.beforeEach(async ({ page }) => {

    // Login
    await page.goto('http://localhost:3000/login');

    await page.getByLabel(/email/i).fill('alice@flashguard.local');
    await page.getByLabel(/password/i).fill('offline-demo');

    await page.getByRole('button', {
      name: /sign in|login|log in/i
    }).click();

    await page.waitForURL('**/dashboard');

    // Open transaction history
    await page.goto('http://localhost:3000/history');

    await expect(
      page.getByText('Ledger & Reporting')
    ).toBeVisible();
  });

  // FG-RE-002: Valid date range
  test('FG-RE-002: Filter transactions by a valid date range', async ({ page }) => {

    const dates = page.locator('input[type="date"]');

    await expect(dates).toHaveCount(2);

    await dates.nth(0).fill('2026-10-01');
    await dates.nth(1).fill('2026-10-29');

    await page.getByRole('button', { name: 'Apply Filters' }).click();

    await expect(page.getByText('Showing')).toBeVisible();
  });

  // FG-RE-003: Invalid date range
  test('FG-RE-003: Reject a start date after the end date', async ({ page }) => {

    const dates = page.locator('input[type="date"]');

    await expect(dates).toHaveCount(2);

    await dates.nth(0).fill('2026-10-29');
    await dates.nth(1).fill('2026-10-01');

    await page.getByRole('button', { name: 'Apply Filters' }).click();

    await expect(
      page.getByText(/invalid date range|start date must be|end date must be/i)
    ).toBeVisible();
  });

  // FG-RE-004: Same start and end date
  test('FG-RE-004: Accept the same start and end date', async ({ page }) => {

    const dates = page.locator('input[type="date"]');

    await expect(dates).toHaveCount(2);

    await dates.nth(0).fill('2026-10-29');
    await dates.nth(1).fill('2026-10-29');

    await page.getByRole('button', { name: 'Apply Filters' }).click();

    await expect(page.getByText('Showing')).toBeVisible();
  });

});

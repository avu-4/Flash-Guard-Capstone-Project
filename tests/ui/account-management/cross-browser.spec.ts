
import { test, expect } from '@playwright/test';

test.describe('FlashGuard - Chrome Compatibility', () => {

  test('FG-UI-001: Verify FlashGuard works in latest Chrome', async ({ page }) => {

    // Open FlashGuard
    await page.goto('http://localhost:3000');

    // Verify the application loads
    await expect(page).toHaveTitle(/flashguard/i);

    // Verify the main page is visible
    await expect(page.locator('body')).toBeVisible();

    // Verify the page has loaded without a blank screen
    await expect(
      page.locator('body')
    ).not.toBeEmpty();

    // Check dashboard navigation
    await page.goto('http://localhost:3000/dashboard');

    await expect(page.locator('body')).toBeVisible();

    // Check transaction history page
    await page.goto('http://localhost:3000/history');

    await expect(page.locator('body')).toBeVisible();

  });

});

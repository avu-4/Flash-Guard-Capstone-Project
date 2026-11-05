
import { test, expect } from '@playwright/test';

test.describe('FlashGuard - Firefox Compatibility', () => {

  test('FG-UI-002: Verify FlashGuard works in latest Firefox', async ({ page }) => {

    // Open FlashGuard
    await page.goto('http://localhost:3000');

    // Verify the home page loads
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toBeEmpty();

    // Verify the dashboard loads
    await page.goto('http://localhost:3000/dashboard');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toBeEmpty();

    // Verify transaction history loads
    await page.goto('http://localhost:3000/history');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toBeEmpty();

  });

});

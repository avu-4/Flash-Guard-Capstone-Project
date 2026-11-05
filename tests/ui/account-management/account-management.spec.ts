
import { test, expect } from '@playwright/test';

test.describe('FlashGuard - Account Management', () => {

  test.beforeEach(async ({ page }) => {
    // Open FlashGuard
    await page.goto('http://localhost:3000');

    // Navigate to Account Management
    await page.getByText('Account Management').click();
  });

  test('FG-AM-001: Update profile (name, email, phone)', async ({ page }) => {

    // Verify profile page is displayed
    await expect(
      page.getByText(/profile|account management/i).first()
    ).toBeVisible();

    // Update full name
    await page.getByLabel(/name|full name/i).fill('Test User');

    // Update email
    await page.getByLabel(/email/i).fill('testuser@example.com');

    // Update phone number
    await page.getByLabel(/phone/i).fill('0821234567');

    // Save profile changes
    await page.getByRole('button', {
      name: /save|update profile/i,
    }).click();

    // Verify successful update
    await expect(
      page.getByText(/profile updated|changes saved|success/i)
    ).toBeVisible();

  });

});

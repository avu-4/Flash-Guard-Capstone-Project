




 import { test, expect } from '@playwright/test';

test.describe('FlashGuard - Change Password', () => {

  test.beforeEach(async ({ page }) => {

    // Login
    await page.goto('http://localhost:3000/login');

    await page.getByLabel(/email/i).fill('alice@flashguard.local');
    await page.getByLabel(/password/i).fill('offline-demo');

    await page.getByRole('button', {
      name: /sign in|login|log in/i
    }).click();

    await page.waitForURL('**/dashboard');


    // Navigate to Account Management
    await page.getByText('Account Management').click();
  });

  test('FG-AM-002: Change account password', async ({ page }) => {

    // Open password settings
    await page.getByText(/change password/i).click();

    // Verify password form is displayed
    await expect(
      page.getByText(/change password/i).first()
    ).toBeVisible();

    // Enter current password
    await page.getByLabel(/current password/i).fill('OldPassword123!');

    // Enter new password
    await page.getByLabel(/new password/i).fill('NewPassword123!');

    // Confirm new password
    await page.getByLabel(/confirm password/i).fill('NewPassword123!');

    // Submit password change
    await page.getByRole('button', {
      name: /change password|update password|save/i,
    }).click();

    // Verify successful password change
    await expect(
      page.getByText(/password changed|password updated|success/i)
    ).toBeVisible();

  });

});

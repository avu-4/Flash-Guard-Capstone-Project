
/*import { test, expect } from '@playwright/test';

test.describe('FlashGuard - Payment Method Management', () => {

  test.beforeEach(async ({ page }) => {
    // Open FlashGuard
    await page.goto('http://localhost:3000');

    // Navigate to Account Management
    await page.getByText('Account Management').click();
  });

  test('FG-AM-003: Add and remove payment method', async ({ page }) => {

    // Open payment methods
    await page.getByText(/payment methods/i).click();

    // Verify payment methods section
    await expect(
      page.getByText(/payment methods/i).first()
    ).toBeVisible();

    // Add a new payment method
    await page.getByRole('button', {
      name: /add payment method|add new/i,
    }).click();

    // Fill in payment method details
    await page.getByLabel(/cardholder name/i).fill('Test User');

    // Use test card details only
    await page.getByLabel(/card number/i).fill('4111111111111111');

    await page.getByLabel(/expiry date/i).fill('12/30');

    await page.getByLabel(/cvv|security code/i).fill('123');

    // Save payment method
    await page.getByRole('button', {
      name: /save|add payment method/i,
    }).click();

    // Verify successful addition
    await expect(
      page.getByText(/payment method added|successfully added/i)
    ).toBeVisible();

    // Remove the added payment method
    await page.getByRole('button', {
      name: /remove|delete/i,
    }).click();

    // Confirm removal if a confirmation dialog appears
    const confirmButton = page.getByRole('button', {
      name: /confirm|yes, remove|delete/i,
    });

    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Verify successful removal
    await expect(
      page.getByText(/payment method removed|successfully removed/i)
    ).toBeVisible();

  });

});*/



/*import { test, expect } from '@playwright/test';

test.describe('FlashGuard - Payment Method Management', () => {

  test.beforeEach(async ({ page }) => {

    // Login
    await page.goto('http://localhost:3000/login');

    await page.getByLabel(/email/i).fill('alice@flashguard.local');
    await page.getByLabel(/password/i).fill('offline-demo');

    await page.getByRole('button', {
      name: /sign in|login|log in/i
    }).click();

  ;

    // Navigate directly to Payment Methods
    await page.goto('http://localhost:3000/payment-methods');

    await expect(
      page.getByRole('heading', { name: 'Payment Methods' })
    ).toBeVisible();

  });*/

  /*test('FG-AM-003: Add and remove payment method', async ({ page }) => {
//click on button
await page.getByRole('button', { name: 'Add Payment Method' }).click();

    // Fill in card details
   await page.getByPlaceholder('Card Number (16 digits)')
  .fill('4123456789987456');

    await page.getByPlaceholder('Nickname (e.g., My Visa)')
      .fill('Avumile test');

    await page.getByPlaceholder('Expiry Date (MM/YY)')
      .fill('12/30');

    await page.getByPlaceholder('CVV')
      .fill('123');

    // Add card
    await page.getByRole('button', {
      name: 'Add Card'
    }).click();

    // Verify card was added
  // Verify the newly added card
const cardRow = page.getByRole('row').filter({
  hasText: 'Avumile test'
});

await expect(cardRow).toBeVisible();

console.log('PASS: Payment method added successfully.');

  });

})
*/


import { test, expect } from '@playwright/test';

test.describe('FlashGuard - Payment Method Management', () => {

  test.beforeEach(async ({ page }) => {

    // Step 1: Login
    await page.goto('http://localhost:3000/login');

    await page.getByLabel(/email/i)
      .fill('alice@flashguard.local');

    await page.getByLabel(/password/i)
      .fill('offline-demo');

    await page.getByRole('button', {
      name: /sign in|login|log in/i
    }).click();

    await page.waitForURL('**/dashboard');

    // Step 2: Navigate to Payment Methods
    await page.goto('http://localhost:3000/payment-methods');

    await expect(
      page.getByRole('heading', { name: 'Payment Methods' })
    ).toBeVisible();

  });

  test('FG-AM-003: Add and remove payment method', async ({ page }) => {

    // Step 3: Click Add Payment Method
    await page.getByRole('button', {
      name: 'Add Payment Method'
    }).click();

    // Step 4: Fill in card details
    await page.getByPlaceholder('Card Number (16 digits)')
      .fill('4123456789987456');

    await page.getByPlaceholder('Nickname (e.g., My Visa)')
      .fill('Avumile test');

    await page.getByPlaceholder('Expiry Date (MM/YY)')
      .fill('12/30');

    await page.getByPlaceholder('CVV')
      .fill('123');

    // Step 5: Add card
    await page.getByRole('button', {
      name: 'Add Card'
    }).click();

    // Step 6: Verify card was added
    const cardRow = page.getByRole('row').filter({
      hasText: 'Avumile test'
    });

    await expect(cardRow).toHaveCount(1);

    await expect(cardRow).toBeVisible();

    console.log('PASS: Payment method added successfully.');

    // Step 7: Find and click Remove button
    const removeButton = cardRow.getByRole('button', {
      name: /remove|delete/i
    });

    await expect(removeButton).toBeVisible();

    await removeButton.click();

    // Step 8: Confirm removal if confirmation appears
    const confirmButton = page.getByRole('button', {
      name: /confirm|yes|remove|delete/i
    });

    if (await confirmButton.isVisible().catch(() => false)) {
      await confirmButton.click();
    }

    // Step 9: Verify card was removed
    await expect(cardRow).toHaveCount(0);

    console.log('PASS: Payment method removed successfully.');

  });

});


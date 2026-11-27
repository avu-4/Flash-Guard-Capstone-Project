import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { FlashWorld } from '../../../src/support/world';
import { resetDatabase } from '../testData/db';
import { openTransferPage, submitTransfer } from '../hooks/helpers';

// Case-insensitive "contains" match, so small wording differences don't break the test.
const contains = (text: string) =>
  new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

// ---------- Background ----------

// Puts the database back to its known starting state (same function the @FR-003 hook uses).
// The login itself is done by "the user is on the dashboard page" (dashboard.steps.ts).
Given('the application has seeded notification data', async function (this: FlashWorld) {
  await resetDatabase();
});

// ---------- When ----------

When('the user opens the notifications panel', async function (this: FlashWorld) {
  await this.page.getByRole('button', { name: 'notifications' }).click();
});

When('the user makes a successful transfer', async function (this: FlashWorld) {
  await openTransferPage(this.page);
  await submitTransfer(this.page, { amount: 10, reference: 'Notification test' });
});

When('the user submits a failed transfer', async function (this: FlashWorld) {
  // A R0 transfer is rejected by the app ("Invalid transfer payload"),
  // so no mocking is needed to get a real error.
  await openTransferPage(this.page);
  await submitTransfer(this.page, { amount: 0, reference: 'Failed transfer test' });
});

// ---------- Then ----------

Then('a notification containing {string} should be visible', async function (this: FlashWorld, message: string) {
  await expect(
    this.page.getByText(contains(message)).first(),
    `No notification containing "${message}" was found`
  ).toBeVisible({ timeout: 10_000 });
});

Then('an error notification containing {string} should be visible', async function (this: FlashWorld, message: string) {
  await expect(
    this.page.getByText(contains(message)).first(),
    `No error message containing "${message}" was found`
  ).toBeVisible({ timeout: 10_000 });
});

Then('the error notification should not expose technical details', async function (this: FlashWorld) {
  const body = await this.page.locator('body').innerText();
  expect(body).not.toMatch(/stack ?trace|exception|sql|syntax error|\bat \w+\.\w+ \(|\bundefined\b|\bnull\b/i);
});

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { FlashWorld } from '../../../../src/support/world';

import { timing, getCredentials, readNetWorthText, parseMoney, loginAndOpenDashboard } from '../../hooks/helpers';
// ---------- Given ----------

// Shared by dashboard.feature and notifications.feature
Given('the user is on the dashboard page', async function (this: FlashWorld) {
  await loginAndOpenDashboard(this.page);
});

// ---------- When ----------

When('the dashboard finishes loading', async function (this: FlashWorld) {
  await expect(this.page.getByRole('heading', { name: 'Portfolio Overview' })).toBeVisible();
  await expect(this.page.getByText('Total Net Worth')).toBeVisible();
  timing.durationMs = Date.now() - timing.start;
});

When('the user refreshes the page', async function (this: FlashWorld) {
  await this.page.reload();
});

When('the user clicks the View All link', async function (this: FlashWorld) {
  await this.page.getByRole('link', { name: 'View All' }).click();
});

// ---------- Then ----------

// T-UI-DASH-001
Then('the dashboard should load within {int} seconds', async function (this: FlashWorld, seconds: number) {
  expect(
    timing.durationMs,
    `Dashboard took ${timing.durationMs}ms, limit is ${seconds * 1000}ms`
  ).toBeLessThanOrEqual(seconds * 1000);
});

// T-UI-DASH-002
Then('the account balance should be displayed in a valid Rand format', async function (this: FlashWorld) {
  const shown = await readNetWorthText(this.page);
  expect(shown, `Balance shown: "${shown}"`).toMatch(/^R\s?-?\d[\d\s\u00a0.,]*[.,]\d{2}$/);
});

Then('the account balance should be the same after refreshing', async function (this: FlashWorld) {
  const before = parseMoney(await readNetWorthText(this.page));
  await this.page.reload();
  const after = parseMoney(await readNetWorthText(this.page));
  expect(after).toBeCloseTo(before, 2);
});

// T-UI-DASH-003  (Account/profile info display)
// Uses the name part of the login email, e.g. "alice" from alice@...
Then('Account and profile information is displayed', async function (this: FlashWorld) {
  const namePart = getCredentials().email.split('@')[0];
  await expect(this.page.getByText(new RegExp(namePart, 'i')).first()).toBeVisible();
});
 
Then('the account information should be displayed', async function (this: FlashWorld) {
  await expect(this.page.getByText('Total Net Worth')).toBeVisible();
  const amount = await readNetWorthText(this.page);
  expect(amount, 'No account amount shown').toMatch(/\d/);
});

// T-UI-DASH-004
Then('the dashboard should display at most 10 recent transactions newest first', async function (this: FlashWorld) {
  await expect(this.page.getByRole('heading', { name: 'Recent Transactions' })).toBeVisible();
  const rows = this.page.getByText(/^Transfer #\d+$/);
  const texts = await rows.allInnerTexts();

  expect(texts.length, 'No transactions shown').toBeGreaterThan(0);
  expect(texts.length, 'More than 10 transactions shown').toBeLessThanOrEqual(10);

  // Newest first = highest transaction number first
  const numbers = texts.map((t) => parseInt(t.replace(/\D/g, ''), 10));
  const sortedDesc = [...numbers].sort((a, b) => b - a);
  expect(numbers, `Order shown: ${texts.join(', ')}`).toEqual(sortedDesc);
});

// T-UI-DASH-005
Then('the dashboard should display all main sections', async function (this: FlashWorld) {
  const p = this.page;
  await expect(p.getByRole('heading', { name: 'Portfolio Overview' })).toBeVisible();
  await expect(p.getByText('Total Net Worth')).toBeVisible();
  await expect(p.getByRole('heading', { name: 'Recent Transactions' })).toBeVisible();
  await expect(p.getByRole('link', { name: /Buy Airtime/ })).toBeVisible();
  await expect(p.getByRole('link', { name: /Send Money/ })).toBeVisible();
  await expect(p.getByRole('link', { name: 'View All' })).toBeVisible();
});

// T-UI-DASH-006
Then('the dashboard should not show broken values', async function (this: FlashWorld) {
  const body = await this.page.locator('body').innerText();
  expect(body).not.toMatch(/\b(undefined|NaN|null)\b|\[object Object\]/);
});

// T-UI-DASH-007  (uses the name part of the login email, e.g. "alice" from alice@...)
Then('the logged-in user name should be displayed', async function (this: FlashWorld) {
  const namePart = getCredentials().email.split('@')[0];
  await expect(this.page.getByText(new RegExp(namePart, 'i')).first()).toBeVisible();
});

// T-UI-DASH-008
Then('the Transaction History page should be displayed', async function (this: FlashWorld) {
  await expect(this.page.getByRole('heading', { name: 'Ledger & Reporting' })).toBeVisible();
});
import { expect, Page } from '@playwright/test';
import { config } from '../../../src/support/config';


/**
 * Login details come from the shared config (src/support/config.ts),
 * which reads TEST_USER_A_EMAIL / TEST_USER_A_PASSWORD from your .env file.
 */
export function getCredentials() {
  return config.credentials.primary;
}

// Used to measure dashboard load time between steps.
export const timing = { start: 0, durationMs: 0 };

// Balance noted before an action, so we can check it afterwards.
export const state = { balanceBefore: 0 };

/** "R 10 000,00" -> 10000, "R 12,500.50" -> 12500.5 */
export function parseMoney(text: string): number {
  const s = text.replace(/[^\d,.\-]/g, '');
  const m = s.match(/^(-?[\d.,]*?)[.,](\d{1,2})$/);
  if (m) return parseFloat(`${m[1].replace(/[.,]/g, '')}.${m[2]}`);
  return parseFloat(s.replace(/[.,]/g, ''));
}

/** Sign in and open the Dashboard (flow taken from your Playwright recording). */
export async function loginAndOpenDashboard(page: Page) {
  const { email, password } = getCredentials();
  await page.goto('/'); // baseURL is set in hooks.ts
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  const dashboardLink = page.getByRole('link', { name: /Dashboard/ });
  await dashboardLink.waitFor({ state: 'visible' });
  timing.start = Date.now();
  await dashboardLink.click();
}

/**
 * Finds the amount that belongs to the "Total Net Worth" label.
 * It starts at the label and walks up through its parent elements until one
 * contains an amount, so it works whether the amount is above, below or
 * beside the label. Returns the text exactly as shown, e.g. "R 10 000,00".
 */
export async function readNetWorthText(page: Page): Promise<string> {
  const label = page.getByText('Total Net Worth').first();
  await expect(label).toBeVisible();

  const amount = await label.evaluate((el: any) => {
    const money = /(?:R|ZAR|\$|€|£)?[\s\u00a0]*-?\d[\d\s\u00a0.,]*[.,]\d{2}/;
    let node: any = el;
    while (node) {
      const match = (node.innerText || '').match(money);
      if (match) return match[0];
      node = node.parentElement;
    }
    return null;
  });

  if (!amount) throw new Error('Could not find an amount near "Total Net Worth"');
  return amount.trim();
}

export async function readNetWorth(page: Page): Promise<number> {
  return parseMoney(await readNetWorthText(page));
}

export async function openTransferPage(page: Page) {
  await page.getByRole('link', { name: /Transfer Funds/ }).click();
  await expect(page.getByRole('heading', { name: 'Transfer Funds' })).toBeVisible();
}

/**
 * Fills the transfer form and clicks Confirm & Transfer.
 * Uses the first account and the default/first beneficiary shown, so it
 * doesn't depend on any particular user's data.
 */
export async function submitTransfer(page: Page, opts: { amount: number; reference: string }) {
  await page.getByRole('radio').first().check();

  // If a beneficiary is already "Selected", keep it. Otherwise pick the first one.
  const alreadySelected = await page.getByRole('button', { name: /^Selected$/ }).count();
  if (!alreadySelected) {
    await page.getByRole('button', { name: /^Select$/ }).first().click();
  }

  await page.getByPlaceholder('0.00').fill(String(opts.amount));
  await page.getByPlaceholder('e.g. Invoice INV-2024-001').fill(opts.reference);
  await page.getByRole('button', { name: /Confirm & Transfer/ }).click();
}

// ---- GUESS: replace after inspecting the app ----
export const SEL = {
  notificationPanel: '[data-testid="notification-panel"], [role="dialog"], [role="menu"]',
};

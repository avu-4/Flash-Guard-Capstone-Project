
import { Page } from "@playwright/test";

export async function selectSender(
  page: Page,
  account: string
): Promise<void> {
  await page
    .locator("span.font-label-md.text-label-md.text-on-surface-variant")
    .filter({ hasText: account })
    .first()
    .click();
}

export async function selectRecipient(
  page: Page,
  beneficiary: string
): Promise<void> {
  const recipient = page
    .locator("span.font-label-md.text-label-md.text-primary")
    .filter({ hasText: beneficiary });

  const count = await recipient.count();

  if (count === 0) {
    throw new Error(
      `Saved recipient not found: ${beneficiary}`
    );
  }

  await recipient.first().click();
}

export async function enterAmount(
  page: Page,
  amount: string
): Promise<void> {
  const field = page.getByPlaceholder("0.00");

  if (/^-?\d*\.?\d*$/.test(amount)) {
    await field.fill(amount);
  } else {
    await field.pressSequentially(amount);
  }
}

export async function enterReference(
  page: Page,
  reference: string
): Promise<void> {
  await page
    .getByPlaceholder("e.g. Invoice INV-2024-001")
    .fill(reference);
}

export async function confirmTransfer(page: Page): Promise<void> {
  await page
    .getByRole("button", { name: /Confirm & Transfer/ })
    .click();
}

export async function transferMoney(
  page: Page,
  account: string,
  beneficiary: string,
  amount: string,
  reference = ""
): Promise<void> {
  await selectSender(page, account);
  await selectRecipient(page, beneficiary);
  await enterAmount(page, amount);

  if (reference) {
    await enterReference(page, reference);
  }

  await confirmTransfer(page);
}

export function toPlainAmount(display: string): string {
  return display.replace(/[^\d,.-]/g, "").replace(",", ".");
}


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
  // The list is filtered by the search box, and a pre-selected recipient fills
  // that box, so search for the one we want first
  await page.getByPlaceholder(/Search saved beneficiaries/).fill(beneficiary);

  const card = page.locator("div.cursor-pointer").filter({ hasText: beneficiary }).first();
  try {
    await card.waitFor({ state: "visible", timeout: 10_000 });
  } catch {
    const listed = await page.locator("div.cursor-pointer").allTextContents();
    throw new Error(
      `Saved recipient not found: ${beneficiary}. Cards on the page: [${listed.join(" | ")}]`
    );
  }
  await card.click();
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

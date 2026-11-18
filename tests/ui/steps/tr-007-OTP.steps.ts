import { When, Then } from "@cucumber/cucumber";
import { expect, Page } from "@playwright/test";
import { FlashWorld } from "../../../src/support/world";
import { getBalance, getLatestTransactionStatus } from "../testData/db";

const MOBILE_URL = process.env.MOBILE_URL ?? "http://localhost:3001";

// The mobile app runs in a second page of the same browser. One per scenario.
const mobilePages = new WeakMap<object, { page: Page; amount: string }>();

function mobileOf(world: FlashWorld) {
  const mobile = mobilePages.get(world);
  if (!mobile) throw new Error("The mobile app isn't open: run the 'open the pending approval' step first");
  return mobile;
}

// The card that shows the one-time code for this transfer.
// It is the innermost block that contains both the "One-time code" label and the amount.
function pendingCard(mobile: Page, amount: string) {
  const [whole, cents] = amount.split(".");
  const amountPattern = new RegExp(`(^|[^\\d])${whole}[.,]${cents}`);
  return mobile
    .locator("div")
    .filter({ has: mobile.getByText("One-time code") })
    .filter({ hasText: amountPattern })
    .last();
}

When(
  "I open the pending approval for {string} in the mobile app",
  async function (this: FlashWorld, amount: string) {
    const page = await this.context.newPage();
    mobilePages.set(this, { page, amount });

    await page.goto(MOBILE_URL);
    await page.getByPlaceholder(/9001015000081/).fill("alice@flashguard.local");
    await page.getByPlaceholder("••••••••").fill("offline-demo");
    await page.getByText("Sign In", { exact: true }).first().click();
    await expect(page.getByText("Welcome back,")).toBeVisible({ timeout: 15_000 });

    await page.getByText("History", { exact: true }).last().click(); // bottom tab
    await page.getByText("Pending", { exact: true }).first().click(); // filter chip
    await expect(pendingCard(page, amount)).toBeVisible({ timeout: 10_000 });
  }
);

When(
  "I enter the OTP {string} in the mobile app",
  async function (this: FlashWorld, otp: string) {
    const { page, amount } = mobileOf(this);
    const card = pendingCard(page, amount);

    let code = otp;
    if (otp === "the code shown on the card") {
      // read the real code from the card: the only text made of exactly 6 digits
      code = ((await card.getByText(/^\d{6}$/).first().textContent()) ?? "").trim();
    }
    await card.getByPlaceholder("Enter 6-digit OTP").fill(code);
  }
);

When("I approve the transfer in the mobile app", async function (this: FlashWorld) {
  const { page, amount } = mobileOf(this);

  // A correct code makes the app call the authorize API; a wrong one never does.
  const authorizeCall = page
    .waitForResponse((r) => r.url().includes("/authorize"), { timeout: 3000 })
    .catch(() => null);

  await pendingCard(page, amount).getByText("Approve", { exact: true }).click();
  await authorizeCall;
});

Then(
  "the transfer is completed and the balances are updated",
  async function (this: FlashWorld) {
    await expect.poll(() => getLatestTransactionStatus()).toBe("completed");
    expect(await getBalance("Alice Ledger")).toBe("9500.00");
    expect(await getBalance("Bob Wallet")).toBe("3000.00");
  }
);

Then(
  "the transfer remains {string} and the balances are unchanged",
  async function (this: FlashWorld, status: string) {
    expect(await getLatestTransactionStatus()).toBe(status.toLowerCase());
    expect(await getBalance("Alice Ledger")).toBe("10000.00");
    expect(await getBalance("Bob Wallet")).toBe("2500.00");
  }
);
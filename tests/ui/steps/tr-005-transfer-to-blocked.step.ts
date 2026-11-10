import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { FlashWorld } from "../../../src/support/world";
import {
  setAccountActive,
  setBlacklistStatus,
  countTransactions,
  SEEDED_TRANSACTIONS,
} from "../testData/db";

// ---------- Given: the three <recipient_setup> sentences ----------

Given("the recipient account is inactive", async function (this: FlashWorld) {
  await setAccountActive("Charlie Frozen", false);
});

Given(
  "the recipient {string} has blacklist status {string}",
  async function (this: FlashWorld, recipientName: string, status: string) {
    await setBlacklistStatus(recipientName, status);
  }
);

Given(
  "no account exists with the number {string}",
  async function (this: FlashWorld, _accountNumber: string) {
    // Nothing to set up: ZZ999999 isn't in the seed data, so it already doesn't exist
  }
);

// ---------- When ----------

// Type the value into the beneficiary search box; if a saved account matches, click it.
// If nothing matches (an unknown number), the typed value stays in the box and is sent as entered.
When(
  "I identify the recipient as {string}",
  async function (this: FlashWorld, recipient: string) {
    await this.page.getByPlaceholder(/Search saved beneficiaries/).fill(recipient);

    const card = this.page.locator("div.cursor-pointer").filter({ hasText: recipient }).first();
    const found = await card
      .waitFor({ state: "visible", timeout: 3000 })
      .then(() => true)
      .catch(() => false);

    if (found) await card.click();
  }
);

// Click only if the app allows it
When("I confirm the transfer", async function (this: FlashWorld) {
  const button = this.page.getByRole("button", { name: /Confirm & Transfer/ });
  if (await button.isEnabled()) await button.click();
});

// ---------- Then ----------

Then(
  "an error notification is displayed with the message {string}",
  async function (this: FlashWorld, message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }
);

Then("no transfer is created", async function (this: FlashWorld) {
  expect(await countTransactions()).toBe(SEEDED_TRANSACTIONS);
});
import { Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { FlashWorld } from "../../../../src/support/world";
import { selectSender } from "../../transferMoney/transferMoney";
import { countTransactions, SEEDED_TRANSACTIONS } from "../../testData/db";

const searchBox = (w: FlashWorld) => w.page.getByPlaceholder(/Search saved beneficiaries/);
const confirmButton = (w: FlashWorld) => w.page.getByRole("button", { name: /Confirm & Transfer/ });

// The page pre-fills the search box with the pre-selected recipient, which hides everyone else.
// Clear it first, so the check is on the full list and not on a filtered one.
Then(
  "{string} is not listed as an available recipient",
  async function (this: FlashWorld, name: string) {
    await searchBox(this).fill("");
    const cards = searchBox(this).locator("xpath=ancestor::section[1]").locator("div.cursor-pointer");
    await expect(cards.first()).toBeVisible();                       // the list is showing others...
    await expect(cards.filter({ hasText: name })).toHaveCount(0);    // ...but not this account
  }
);

When(
  "I change the sender account to {string}",
  async function (this: FlashWorld, name: string) {
    await selectSender(this.page, name);
  }
);

// With no recipient chosen, the review panel shows "Pending Selection"
Then("the recipient selection is cleared", async function (this: FlashWorld) {
  await expect(this.page.getByText("Pending Selection")).toBeVisible();
});

Then("the {string} button is disabled", async function (this: FlashWorld, name: string) {
  await expect(this.page.getByRole("button", { name })).toBeDisabled();
});

Then(
  "no transfer can be submitted from {string} to {string}",
  async function (this: FlashWorld, _from: string, _to: string) {
    const button = confirmButton(this);
    if (await button.isEnabled()) {
      await button.click();
      // wait for the app's answer, otherwise the database could be read too early
      await this.page.getByRole("status").first().waitFor({ timeout: 5000 }).catch(() => {});
    }
    expect(await countTransactions()).toBe(SEEDED_TRANSACTIONS);
  }
);
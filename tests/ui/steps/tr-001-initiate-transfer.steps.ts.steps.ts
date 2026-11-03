import {expect} from '@playwright/test';
import { Given, When, Then, DataTable, } from '@cucumber/cucumber';
import { FlashGuardWorld } from '../world/world';
import { toPlainAmount, transferMoney } from '../transferMoney/transferMoney';

Then('a success notification is displayed confirming the transfer was created', async function (this : FlashGuardWorld) {
  await expect(
  this.page.getByText(/^Transfer #\d+ created successfully!$/)).toBeVisible();
});

Then("the transfer form is cleared", async function (this: FlashGuardWorld) {
  await expect(this.page.getByPlaceholder("0.00")).toHaveValue("");
  await expect(this.page.getByPlaceholder("e.g. Invoice INV-2024-001")).toHaveValue("");
});
const ACCOUNT_ID: Record<string, number> = {
  "Alice Ledger": 1,
  "Bob Wallet": 2,
  "Charlie Frozen": 3,
};

Then(
  "the transfer {string} from {string} to {string} appears in my transaction history with status {string}",
  async function (this: FlashGuardWorld, amount: string, from: string, to: string, status: string) {
    await this.page.goto("/history");
    const route = `Acct ${ACCOUNT_ID[from]} to ${ACCOUNT_ID[to]}`;

    const countMatches = async (): Promise<number> => {
      let count = 0;
      for (const row of await this.page.locator("tbody tr").filter({ hasText: route }).all()) {
        const cells = await row.locator("td").allTextContents();
        // columns: Date | Reference | Description | Type | Amount | Status | actions
        if (
          toPlainAmount(cells[4] ?? "") === amount &&
          (cells[5] ?? "").toLowerCase().includes(status.toLowerCase())
        ) {
          count++;
        }
      }
      return count;
    };

    // exactly one: the seed has a *completed* 250.00 Alice -> Bob, so a *pending*
    // 250.00 can only be the one this scenario just created
    await expect.poll(countMatches).toBe(1);
  }
);


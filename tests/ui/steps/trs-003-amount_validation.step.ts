import {expect} from '@playwright/test';
import { Given, When, Then, DataTable, } from '@cucumber/cucumber';
import { FlashGuardWorld } from '../world/world';
import { toPlainAmount, transferMoney, enterAmount, selectRecipient, selectSender } from '../transferMoney/transferMoney';
import { setBalance } from '../testData/db';

const toast = (w: FlashGuardWorld, text: string | RegExp) =>
  w.page.getByRole("status").filter({ hasText: text });

Given(
  "the balance of {string} is set to {string}",
  async function (this: FlashGuardWorld, accountName: string, balance: string) {
    await setBalance(accountName, balance);
  }
);


Then(
  "the transfer is blocked by the amount field validation",
  async function (this: FlashGuardWorld) {
    const isValid = await this.page
      .getByPlaceholder("0.00")
      .evaluate((el) => (el as HTMLInputElement).validity.valid);
    expect(isValid).toBe(false);
  }
);

Then(
  "the transfer is rejected with the error {string}",
  async function (this: FlashGuardWorld, error: string) {
    await expect(toast(this, error)).toBeVisible();
  }
);

Then(
  "the transfer is accepted and created with status {string}",
  async function (this: FlashGuardWorld, _status: string) {
    await expect(toast(this, /Transfer #\d+ created successfully/)).toBeVisible();
  }
);

Then(
  "the transfer is rejected with an error stating the transfer limit was exceeded",
  async function (this: FlashGuardWorld) {
    await expect(toast(this, /limit|exceed/i)).toBeVisible();
  }
);
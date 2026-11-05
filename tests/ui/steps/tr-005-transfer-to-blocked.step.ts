
import { Given, When, Then } from "@cucumber/cucumber";
import { FlashWorld } from '../../../src/support/world';
import {
  setAccountActive,
  setBlacklistStatus,
  countTransactions,
  SEEDED_TRANSACTIONS,
} from "../testData/db";
import { selectRecipient } from "../transferMoney/transferMoney";
import { expect } from "@playwright/test";

Given(
  "the recipient account is inactive",
  async function (this: FlashWorld) {
    await setAccountActive("Charlie Frozen", false);
  }
);

Given(
  "the recipient {string} has blacklist status {string}",
  async function (
    this: FlashWorld,
    recipientName: string,
    status: string
  ) {
    await setBlacklistStatus(recipientName, status);
  }
);

When(
  "I identify the recipient as {string}",
  async function (
    this: FlashWorld,
    recipient: string
  ) {
    await selectRecipient(this.page, recipient);
  }
);

When(
  "I confirm the transfer",
  async function (this: FlashWorld) {
    const button = this.page.getByRole("button", {
      name: /Confirm & Transfer/,
    });

    await button.click();
  }
);

Then(
  "an error notification is displayed with the message {string}",
  async function (
    this: FlashWorld,
    message: string
  ) {
    await expect(this.page.getByText(message)).toBeVisible();
  }
);

Then(
  "no transfer is created",
  async function (this: FlashWorld) {
    expect(await countTransactions()).toBe(
      SEEDED_TRANSACTIONS
    );
  }
);

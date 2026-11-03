
import { Given, When, Then } from "@cucumber/cucumber";
import { FlashGuardWorld } from "../world/world";
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
  async function (this: FlashGuardWorld) {
    await setAccountActive("Charlie Frozen", false);
  }
);

Given(
  "the recipient {string} has blacklist status {string}",
  async function (
    this: FlashGuardWorld,
    recipientName: string,
    status: string
  ) {
    await setBlacklistStatus(recipientName, status);
  }
);

When(
  "I identify the recipient as {string}",
  async function (
    this: FlashGuardWorld,
    recipient: string
  ) {
    await selectRecipient(this.page, recipient);
  }
);

When(
  "I confirm the transfer",
  async function (this: FlashGuardWorld) {
    const button = this.page.getByRole("button", {
      name: /Confirm & Transfer/,
    });

    await button.click();
  }
);

Then(
  "an error notification is displayed with the message {string}",
  async function (
    this: FlashGuardWorld,
    message: string
  ) {
    await expect(this.page.getByText(message)).toBeVisible();
  }
);

Then(
  "no transfer is created",
  async function (this: FlashGuardWorld) {
    expect(await countTransactions()).toBe(
      SEEDED_TRANSACTIONS
    );
  }
);

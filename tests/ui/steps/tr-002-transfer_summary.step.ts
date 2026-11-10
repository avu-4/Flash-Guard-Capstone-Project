import { expect } from "@playwright/test";
import { When, Then } from "@cucumber/cucumber";
import { FlashWorld } from '../../../src/support/world';
import {  toPlainAmount } from "../transferMoney/transferMoney";

// The review panel shows each value right after its label
const reviewValue = (w: FlashWorld, label: string) =>
  w.page.getByText(label, { exact: true }).locator("xpath=following-sibling::*").first();

Then("the transfer summary shows the sender {string}", async function (this: FlashWorld, sender: string) {
  await expect(reviewValue(this, "From")).toContainText(sender);
});

Then("the transfer summary shows the recipient {string}", async function (this: FlashWorld, recipient: string) {
  await expect(reviewValue(this, "To")).toContainText(recipient);
});

Then(
  "the transfer summary shows the total amount {string} in ZAR",
  async function (this: FlashWorld, amount: string) {
    await expect
      .poll(async () => toPlainAmount((await reviewValue(this, "Total Amount").textContent()) ?? ""))
      .toBe(amount);
  }
);

Then(
  "the transfer summary shows an estimated fee of {string}",
  async function (this: FlashWorld, fee: string) {
    await expect(reviewValue(this, "Est. Fee")).toHaveText(fee);
  }
);

Then("the {string} button is enabled", async function (this: FlashWorld, name: string) {
  await expect(this.page.getByRole("button", { name })).toBeEnabled();
});
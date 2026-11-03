import { expect } from "@playwright/test";
import { When, Then } from "@cucumber/cucumber";
import { FlashGuardWorld } from "../world/world";
import {  toPlainAmount } from "../transferMoney/transferMoney";

// The review panel shows each value right after its label
const reviewValue = (w: FlashGuardWorld, label: string) =>
  w.page.getByText(label, { exact: true }).locator("xpath=following-sibling::*").first();

Then("the transfer summary shows the sender {string}", async function (this: FlashGuardWorld, sender: string) {
  await expect(reviewValue(this, "From")).toContainText(sender);
});

Then("the transfer summary shows the recipient {string}", async function (this: FlashGuardWorld, recipient: string) {
  await expect(reviewValue(this, "To")).toContainText(recipient);
});

Then(
  "the transfer summary shows the total amount {string} in ZAR",
  async function (this: FlashGuardWorld, amount: string) {
    await expect
      .poll(async () => toPlainAmount((await reviewValue(this, "Total Amount").textContent()) ?? ""))
      .toBe(amount);
  }
);

Then(
  "the transfer summary shows an estimated fee of {string}",
  async function (this: FlashGuardWorld, fee: string) {
    await expect(reviewValue(this, "Est. Fee")).toHaveText(fee);
  }
);

Then("the {string} button is enabled", async function (this: FlashGuardWorld, name: string) {
  await expect(this.page.getByRole("button", { name })).toBeEnabled();
});
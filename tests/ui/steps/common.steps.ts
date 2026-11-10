import {expect} from '@playwright/test';
import { Given, When, Then, DataTable, } from '@cucumber/cucumber';
import { FlashWorld } from '../../../src/support/world';
import { toPlainAmount, transferMoney, enterAmount, selectRecipient, selectSender } from '../transferMoney/transferMoney';

//Background
Given(
  "I am logged in as {string} with password {string}",
  async function (this: FlashWorld, email: string, password: string) {
    await this.page.goto("/login");
    await this.page.getByRole("textbox", { name: "Email address" }).fill(email);
    await this.page.getByRole("textbox", { name: "Password" }).fill(password);
    await this.page.getByRole("button", { name: "Sign In" }).click();
    await this.page.waitForURL((url) => !url.pathname.includes("login"));
  }
);

//Scenario: Initiate a transfer to a valid recipient
Given("I open the Transfers page", async function (this: FlashWorld) {
  await this.page.goto("/transfers");
  await expect(this.page.getByRole("heading", { name: "From Account" })).toBeVisible();
  await expect(
    this.page.locator("span.font-label-md.text-label-md.text-primary").first()
  ).toBeVisible();
});

When('I submit a transfer with the following details:', async function (this : FlashWorld, details : DataTable) {
  for (const row of details.hashes()){
    await transferMoney(this.page, row.sender, row.recipient, row.amount, row.reference);
  }
});

Then(
  "the available balance of {string} is still {string}",
  async function (this: FlashWorld, name: string, expected: string) {
    await this.page.goto("/dashboard");

    const card = this.page
      .getByRole("heading", { name })
      .locator("xpath=ancestor::div[contains(@class,'cursor-pointer')][1]");
    const balance = card.locator("p.font-headline-lg");

    await expect
      .poll(async () => toPlainAmount((await balance.textContent()) ?? ""))
      .toBe(expected);
  }
);


When("I select {string} as the sender account", async function (this: FlashWorld, sender: string) {
  await selectSender(this.page, sender);
});

When("I select {string} as the recipient", async function (this: FlashWorld, recipient: string) {
  await selectRecipient(this.page, recipient);
});

When("I enter the amount {string}", async function (this: FlashWorld, amount: string) {
  await enterAmount(this.page, amount);
});
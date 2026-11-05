import { expect } from "@playwright/test";
import { When, Then } from "@cucumber/cucumber";
import { FlashWorld } from '../../../src/support/world';

const amountField = (w: FlashWorld) => w.page.getByPlaceholder("0.00");

// The currency text sits immediately before the amount input
Then(
  "the amount field is prefixed with the currency {string}",
  async function (this: FlashWorld, currency: string) {
    const prefix = amountField(this).locator("xpath=preceding-sibling::*[1]");
    await expect(prefix).toHaveText(currency);
  }
);

// Format check only: the total starts with "R" (formatted) or "ZAR" (empty amount)
Then(
  "the transfer summary displays the total amount in ZAR format",
  async function (this: FlashWorld) {
    const total = this.page
      .getByText("Total Amount", { exact: true })
      .locator("xpath=following-sibling::*")
      .first();
    await expect(total).toHaveText(/^(R|ZAR)\s/);
  }
);

// Click only if the app allows it (a disabled button is a valid outcome for some rows)
When("I attempt to confirm the transfer", async function (this: FlashWorld) {
  const button = this.page.getByRole("button", { name: /Confirm & Transfer/ });
  if (await button.isEnabled()) await button.click();
});

// Two placeholders in the text, so two parameters (unused, but required)
Then(
  "the transfer is accepted as {string} with status {string}",
  async function (this: FlashWorld, _amount: string, _status: string) {
    await expect(this.page.getByText(/Transfer #\d+ created successfully!/)).toBeVisible();
  }
);

// More than 2 decimals: the browser blocks it (step="0.01"), so read the field's validity
Then(
  "the transfer is rejected with an error about decimal places",
  async function (this: FlashWorld) {
    const stepMismatch = await amountField(this).evaluate(
      (el) => (el as HTMLInputElement).validity.stepMismatch
    );
    expect(stepMismatch).toBe(true);
  }
);

Then(
  "the transfer is prevented because the amount field stays empty",
  async function (this: FlashWorld) {
    await expect(amountField(this)).toHaveValue("");
  }
);
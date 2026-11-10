import { Given, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { FlashWorld } from "../../../src/support/world";

const toast = (w: FlashWorld, text?: string | RegExp) => {
  const status = w.page.getByRole("status");
  return text ? status.filter({ hasText: text }).first() : status.first();
};

const TRANSFER_URL = "**/transactions/transfer";

// ---------- Given: how the transfer service behaves ----------

Given("the transfer service is available", async function (this: FlashWorld) {
  // No-op: the real API is used, so the real rules apply (e.g. insufficient funds)
});

// The API answers, but with a server error (the number is the HTTP status code)
Given(
  "the transfer service responds with a {int} server error",
  async function (this: FlashWorld, status: number) {
    await this.page.route(TRANSFER_URL, (route) => {
      if (route.request().method() !== "POST") return route.continue();
      return route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify({ message: "Internal Server Error" }),
      });
    });
  }
);

// The connection fails at once (server down / no network). The page's fetchJson
// turns this into "Network error - unable to connect to server".
Given("the transfer service is unreachable", async function (this: FlashWorld) {
  await this.page.route(TRANSFER_URL, (route) => {
    if (route.request().method() !== "POST") return route.continue();
    return route.abort("connectionrefused");
  });
});

// The server accepts the request and never answers. The route handler does nothing,
// so the request just hangs, which is what a real timeout looks like to the page.
Given(
  "the transfer service does not respond within {int} seconds",
  async function (this: FlashWorld, _seconds: number) {
    await this.page.route(TRANSFER_URL, (route) => {
      if (route.request().method() !== "POST") return route.continue();
     
    });
  }
);



Then(
  "an error notification is displayed with the text {string}",
  async function (this: FlashWorld, text: string) {
    await expect(toast(this, text)).toBeVisible();
  }
);

Then(
  "an error notification is displayed with a user-friendly message and no technical stack trace",
  async function (this: FlashWorld) {
    const message = toast(this);
    await expect(message).toBeVisible();
    await expect(message).not.toContainText(
      /stack|\bat\s.+\(|undefined|\[object|<html|Exception|TypeError|ECONN/i
    );
  }
);

// Waits longer than 30 seconds, because the scenario says the service is silent for 30 seconds.
// The step has its own 45 s limit so it isn't cut off by Cucumber's default step timeout.
Then(
  "an error notification is displayed with a message that the request timed out",
  { timeout: 45_000 },
  async function (this: FlashWorld) {
    await expect(toast(this, /time(d)?[ -]?out|took too long|try again/i)).toBeVisible({
      timeout: 35_000,
    });
  }
);

Then(
  "the {string} button is enabled again",
  async function (this: FlashWorld, name: string) {
    await expect(this.page.getByRole("button", { name })).toBeEnabled();
  }
);

// After a failure the user shouldn't have to start over
Then(
  "the entered transfer details are still shown on the form",
  async function (this: FlashWorld) {
    await expect(this.page.getByPlaceholder("0.00")).not.toHaveValue("");
    await expect(this.page.getByRole("button", { name: "Selected" })).toBeVisible();
  }
);
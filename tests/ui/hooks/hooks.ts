
import {
  BeforeAll,
  AfterAll,
  Before,
  After,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import { Browser, chromium } from "@playwright/test";
import { FlashGuardWorld } from "../world/world";
import { resetDatabase } from "../testData/db";

setDefaultTimeout(30 * 1000);

let browser: Browser;

BeforeAll(async function () {
  browser = await chromium.launch();
});

AfterAll(async function () {
  await browser.close();
});

// Reset the database before transfer scenarios.
Before({ tags: "@transfers" }, async function () {
  await resetDatabase();
});

Before(async function (this: FlashGuardWorld) {
  this.context = await browser.newContext({
    baseURL: "http://localhost:3000",
  });

  this.page = await this.context.newPage();
});

After(async function (this: FlashGuardWorld) {
  await this.context?.close();
});

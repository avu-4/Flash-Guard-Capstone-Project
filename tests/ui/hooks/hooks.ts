
import {
  BeforeAll,
  AfterAll,
  Before,
  After,
  Status,
  setDefaultTimeout,
} from '@cucumber/cucumber';
import { resetDatabase } from '../testData/db';

import { Browser, chromium } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { FlashWorld } from '../../../src/support/world';
import { config } from '../../../src/support/config';

setDefaultTimeout(30_000);

// Reuse one browser for the complete Cucumber test run.
let browser: Browser;

BeforeAll(async function () {
  browser = await chromium.launch({
    headless: true,
  });
});

Before('@FR-003', async function () {
  await resetDatabase();
});

// Create a fresh browser context for every scenario.
Before(async function (this: FlashWorld) {
  this.browser = browser;

  this.context = await browser.newContext({
    baseURL: config.baseURL,
  });

  // Start tracing for each scenario.
  await this.context.tracing.start({
    screenshots: true,
    snapshots: true,
    sources: true,
  });

  this.page = await this.context.newPage();

  // Initialise your page objects, including LoginPage.
  this.initialisePages();
});

// Capture screenshots and traces when a scenario fails.
After(async function (this: FlashWorld, scenario) {
  try {
    if (
      scenario.result?.status === Status.FAILED &&
      this.page
    ) {
      const screenshot = await this.page.screenshot({
        fullPage: true,
      });

      await this.attach(screenshot, 'image/png');
    }

    if (this.context) {
      if (scenario.result?.status === Status.FAILED) {
        const traceDir = path.resolve('reports/traces');

        await mkdir(traceDir, {
          recursive: true,
        });

        const safeName = scenario.pickle.name.replace(
          /[^a-zA-Z0-9_-]/g,
          '_'
        );

        const tracePath = path.join(
          traceDir,
          `${safeName}-${Date.now()}.zip`
        );

        await this.context.tracing.stop({
          path: tracePath,
        });

        await this.attach(
          await readFile(tracePath),
          'application/zip'
        );
      } else {
        await this.context.tracing.stop();
      }
    }
  } finally {
    await this.context?.close();
  }
});

// Close the shared browser after all scenarios finish.
AfterAll(async function () {
  await browser?.close();
});

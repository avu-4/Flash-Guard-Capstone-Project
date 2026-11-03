import {
  Before,
  After,
  Status,
  setDefaultTimeout,
} from '@cucumber/cucumber';

import { chromium } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { FlashWorld } from '../../../src/support/world';
import { config } from '../../../src/support/config';

// Increase Cucumber's default timeout from 5 to 30 seconds.
setDefaultTimeout(30_000);

Before(async function (this: FlashWorld) {
  this.browser = await chromium.launch({
    headless: true,
  });

  this.context = await this.browser.newContext({
    baseURL: config.baseURL,
  });

  await this.context.tracing.start({
    screenshots: true,
    snapshots: true,
    sources: true,
  });

  this.page = await this.context.newPage();

  this.initialisePages();
});

After(async function (this: FlashWorld, scenario) {
  try {
    if (scenario.result?.status === Status.FAILED && this.page) {
      const screenshot = await this.page.screenshot({
        fullPage: true,
      });

      await this.attach(screenshot, 'image/png');
    }

    if (this.context) {
      if (scenario.result?.status === Status.FAILED) {
        const traceDir = path.resolve('reports/traces');

        await mkdir(traceDir, { recursive: true });

        const safeName = scenario.pickle.name
          .replace(/[^a-zA-Z0-9_-]/g, '_');

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

      await this.context.close();
    }
  } finally {
    await this.browser?.close();
  }
});

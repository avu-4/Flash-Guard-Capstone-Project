import {
  World as CucumberWorld,
  IWorldOptions,
  setWorldConstructor,
} from '@cucumber/cucumber';

import type {
  Browser as PlaywrightBrowser,
  BrowserContext,
  Page,
} from '@playwright/test';

import type { Browser as AppiumBrowser } from 'webdriverio';

export class E2EWorld extends CucumberWorld {
  // Web automation
  webBrowser!: PlaywrightBrowser;
  webContext!: BrowserContext;
  webPage!: Page;

  // Native Android automation
  mobileDriver!: AppiumBrowser;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(E2EWorld);
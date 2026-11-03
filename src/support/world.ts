import {
  World as CucumberWorld,
  IWorldOptions,
  setWorldConstructor,
} from '@cucumber/cucumber';

import {
  Browser,
  BrowserContext,
  Page,
} from '@playwright/test';

import { LoginPage } from '../pages/LoginPage';

export class FlashWorld extends CucumberWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  loginPage!: LoginPage;

  constructor(options: IWorldOptions) {
    super(options);
  }

  initialisePages(): void {
    this.loginPage = new LoginPage(this.page);
  }
}

// Register FlashWorld as Cucumber's custom World.
setWorldConstructor(FlashWorld);

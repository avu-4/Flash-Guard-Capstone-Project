
import {
  World as CucumberWorld,
  IWorldOptions,
  setWorldConstructor,
} from '@cucumber/cucumber';

import type { Browser } from 'webdriverio';

export class MobileWorld extends CucumberWorld {
  driver!: Browser;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(MobileWorld);

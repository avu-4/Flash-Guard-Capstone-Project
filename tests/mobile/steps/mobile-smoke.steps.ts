
import { Given, Then } from '@cucumber/cucumber';
import { strict as assert } from 'node:assert';
import type { MobileWorld } from '../support/world';

Given(
  'the FlashGuard mobile application is running',
  function (this: MobileWorld) {
    assert.ok(this.driver, 'Appium driver was not initialised');
  }
);

Then(
  'the FlashGuard application package should be active',
  async function (this: MobileWorld) {
    const currentPackage = await this.driver.getCurrentPackage();

    assert.equal(
      currentPackage,
      'com.anonymous.flashguadmobileapp',
      'FlashGuard is not the active application'
    );
  }
);

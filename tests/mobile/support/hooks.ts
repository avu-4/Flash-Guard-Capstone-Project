
import {
  Before,
  After,
  setDefaultTimeout,
} from '@cucumber/cucumber';

import { remote } from 'webdriverio';
import type { MobileWorld } from './world';

// Allow more time for Appium and UiAutomator2 to start.
setDefaultTimeout(120_000);

Before(async function (this: MobileWorld) {
  console.log('Starting Appium session...');

  this.driver = await remote({
    hostname: '127.0.0.1',
    port: 4723,
    path: '/',
    logLevel: 'warn',

    // WebdriverIO connection settings
    connectionRetryTimeout: 120_000,
    connectionRetryCount: 1,

    capabilities: {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'Android Emulator',
      'appium:udid': 'emulator-5554',

      'appium:appPackage': 'com.anonymous.flashguadmobileapp',
      'appium:appActivity': '.MainActivity',

      // Keep the existing app installation and data.
      'appium:noReset': true,

      // Allow additional time for Android startup operations.
      'appium:uiautomator2ServerLaunchTimeout': 60000,
      'appium:adbExecTimeout': 60000,
      'appium:androidInstallTimeout': 90000,

      // Reduce animation-related timing problems.
      'appium:disableWindowAnimation': true,

      // Keep the session alive during longer test operations.
      'appium:newCommandTimeout': 120,
    },
  });

  console.log('Appium session created successfully.');
});

After(async function (this: MobileWorld) {
  if (this.driver) {
    console.log('Closing Appium session...');
    await this.driver.deleteSession();
    console.log('Appium session closed.');
  }
});

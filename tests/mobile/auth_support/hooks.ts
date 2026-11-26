import {
  Before,
  After,
  setDefaultTimeout
} from '@cucumber/cucumber';
 
import { remote } from 'webdriverio';
import type { MobileWorld } from './world';
 
// Allow sufficient time for Appium operations.
setDefaultTimeout(60000);
 
const APP_PACKAGE = 'com.anonymous.flashguadmobileapp';
 
// Start Android Appium session before the scenario.
Before(async function (this: MobileWorld) {
  console.log('Starting FlashGuard mobile test...');
 
  this.driver = await remote({
    hostname: '127.0.0.1',
    port: 4723,
    path: '/',
    capabilities: {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'Android Emulator',
      'appium:udid': 'emulator-5554',
      'appium:appPackage': APP_PACKAGE,
      'appium:appActivity':
        'com.anonymous.flashguadmobileapp.MainActivity',
      'appium:noReset': true,
      'appium:newCommandTimeout': 120
    }
  });
 
  console.log('Android Appium session created successfully.');
 
  await this.driver.terminateApp(APP_PACKAGE);
  await this.driver.activateApp(APP_PACKAGE);

  const welcomeHeading = await this.driver.$(
    '//*[@text="Welcome Back"]'
  );
  await welcomeHeading.waitForDisplayed({
    timeout: 30000,
    interval: 500,
    timeoutMsg: 'FlashGuard mobile login screen did not become visible'
  });

  const emailField = await this.driver.$(
    '//android.widget.EditText[1]'
  );
  await emailField.waitForDisplayed({
    timeout: 30000,
    interval: 500,
    timeoutMsg: 'FlashGuard mobile email field did not become visible'
  });

  await this.driver.pause(1500);
});
 
// Close Android Appium session after the scenario.
After(async function (this: MobileWorld) {
  if (this.driver) {
    console.log('Closing Appium session...');
 
    await this.driver.deleteSession();
    this.driver = undefined;
 
    console.log('Appium session closed successfully.');
  }
});

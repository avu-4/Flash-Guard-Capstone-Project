
import { remote } from 'webdriverio';

async function inspectLoginScreen() {
  const driver = await remote({
    hostname: '127.0.0.1',
    port: 4723,
    path: '/',
    logLevel: 'warn',
    capabilities: {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'Android Emulator',
      'appium:udid': 'emulator-5554',
      'appium:appPackage': 'com.anonymous.flashguadmobileapp',
      'appium:appActivity': '.MainActivity',
      'appium:noReset': true
    }
  });

  try {
    const pageSource = await driver.getPageSource();
    console.log(pageSource);
  } finally {
    await driver.deleteSession();
  }
}

inspectLoginScreen();

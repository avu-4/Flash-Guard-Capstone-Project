
import { remote } from 'webdriverio';

async function appiumConnectionTest() {
  let driver;

  try {
    console.log('Connecting to Appium...');

    driver = await remote({
      hostname: '127.0.0.1',
      port: 4723,
      path: '/',
      logLevel: 'info',

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

    console.log('Connected successfully!');
    console.log('Device:', await driver.getDeviceTime());
    console.log('App package:', await driver.getCurrentPackage());

  } catch (error) {
    console.error('Appium connection failed:', error);
  } finally {
    if (driver) {
      await driver.deleteSession();
      console.log('Appium session closed.');
    }
  }
}

appiumConnectionTest();

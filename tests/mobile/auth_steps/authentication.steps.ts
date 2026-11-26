
import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';

import { LoginPage } from '../auth_pages/LoginPage';
import type { MobileWorld } from '../auth_support/world';

// Get the active login page.
function getLoginPage(world: MobileWorld): LoginPage {
  assert.ok(
    world.driver,
    'Appium driver has not been initialised'
  );

  return new LoginPage(world.driver);
}

// Read required credentials without hardcoding passwords.
function getRequiredEnv(name: string): string {
  const value = process.env[name];

  assert.ok(
    value && value.trim().length > 0,
    `Missing environment variable: ${name}`
  );

  return value;
}

// Verify the login screen before executing the test.
Given(
  'the mobile login screen is displayed',
  async function (this: MobileWorld) {
    const page = getLoginPage(this);

    await page.verifyLoginScreen();
  }
);

// Enter valid Alice credentials.
When(
  'the user enters valid credentials',
  async function (this: MobileWorld) {
    const page = getLoginPage(this);

    await page.enterEmail(
      getRequiredEnv('TEST_USER_A_EMAIL')
    );

    await page.enterPassword(
      getRequiredEnv('TEST_USER_A_PASSWORD')
    );
  }
);

// Enter intentionally invalid credentials.
When(
  'the user enters invalid credentials',
  async function (this: MobileWorld) {
    const page = getLoginPage(this);

    await page.enterEmail(
      getRequiredEnv('INVALID_USER_EMAIL')
    );

    await page.enterPassword(
      getRequiredEnv('INVALID_USER_PASSWORD')
    );
  }
);

// Tap the Sign In button.
When(
  'the user taps the sign in button',
  async function (this: MobileWorld) {
    const page = getLoginPage(this);

    await page.tapSignIn();
  }
);

// Dismiss the welcome-back dialog and verify the dashboard.
Then(
  'the dashboard should be displayed',
  async function (this: MobileWorld) {
    const page = getLoginPage(this);

    await page.tapWelcomeDialogOk();

    await page.verifyDashboard();
  }
);

// Verify invalid credentials are rejected.
Then(
  'an authentication error should be displayed',
  async function (this: MobileWorld) {
    const page = getLoginPage(this);

    await page.verifyAuthenticationError();

    await page.dismissAuthenticationError();

    await page.verifyLoginScreen();

    console.log(
      'Invalid credentials rejected successfully. User remains on login screen.'
    );
  }
);

// Background the app for five minutes, then reopen it.
When(
  'the app is sent to the background for five minutes and reopened',
  { timeout: 7 * 60 * 1000 },
  async function (this: MobileWorld) {
    assert.ok(
      this.driver,
      'Appium driver has not been initialised'
    );

    const appPackage = 'com.anonymous.flashguadmobileapp';

    console.log('Sending FlashGuard to the background...');

    // Send the app to the background without terminating it.
    await this.driver.background(0);

    // Wait five minutes, checking periodically that the app remains installed.
    for (let interval = 1; interval <= 10; interval++) {
      await this.driver.pause(30000);

      // Keep the Appium session active without bringing the app forward.
      assert.ok(
        await this.driver.isAppInstalled(appPackage),
        'FlashGuard app is no longer installed.'
      );

      if (interval % 2 === 0) {
        console.log(
          `Background wait completed: ${interval / 2} minute(s).`
        );
      }
    }

    console.log('Reopening FlashGuard...');

    await this.driver.activateApp(appPackage);

    await this.driver.pause(3000);

    console.log('FlashGuard has been reopened.');
  }
);

// Record the authentication state after reopening.
Then(
  'the reopened app authentication state should be recorded',
  async function (this: MobileWorld) {
    assert.ok(
      this.driver,
      'Appium driver has not been initialised'
    );

    const dashboard = await this.driver
      .$('//*[@text="TOTAL NET WORTH"]')
      .isDisplayed()
      .catch(() => false);

    const loginScreen = await this.driver
      .$('//*[@text="Welcome Back"]')
      .isDisplayed()
      .catch(() => false);

    if (dashboard) {
      console.log(
        'OBSERVATION: Dashboard is displayed after reopening. The user remains authenticated.'
      );
    } else if (loginScreen) {
      console.log(
        'OBSERVATION: Login screen is displayed after reopening. The user is no longer authenticated in the visible app state.'
      );
    } else {
      assert.fail(
        'Neither the dashboard nor the login screen was detected after reopening.'
      );
    }
  }
);

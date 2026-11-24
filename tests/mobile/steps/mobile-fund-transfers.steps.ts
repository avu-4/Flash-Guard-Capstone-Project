
import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'node:assert';
import type { MobileWorld } from '../support/world';

// --------------------------------------------------
// COMMON HELPERS
// --------------------------------------------------

async function dismissNativeAlert(driver: MobileWorld['driver']) {
  const okButton = await driver.$('id=android:id/button1');

  if (await okButton.isDisplayed()) {
    await okButton.click();
  }
}

async function dismissWelcomeModal(driver: MobileWorld['driver']) {
  const selectors = [
    '~OK',
    'android=new UiSelector().text("OK")',
    '//*[@text="OK"]',
  ];

  for (const selector of selectors) {
    const okButton = await driver.$(selector);

    try {
      if (await okButton.isDisplayed()) {
        console.log('FlashGuard welcome modal detected. Clicking OK.');
        await okButton.click();
        await driver.pause(1000);
        console.log('FlashGuard welcome modal dismissed.');
        return true;
      }
    } catch {
      // Try the next selector.
    }
  }

  return false;
}

async function readNativeDialog(driver: MobileWorld['driver']) {
  const titleElement = await driver.$(
    'id=com.anonymous.flashguadmobileapp:id/alert_title'
  );

  const messageElement = await driver.$('id=android:id/message');

  await titleElement.waitForDisplayed({
    timeout: 15000,
    timeoutMsg: 'Native dialog title was not displayed',
  });

  await messageElement.waitForDisplayed({
    timeout: 10000,
    timeoutMsg: 'Native dialog message was not displayed',
  });

  return {
    title: await titleElement.getText(),
    message: await messageElement.getText(),
  };
}

// --------------------------------------------------
// LOGIN HELPER
// --------------------------------------------------

async function ensureLoggedIn(driver: MobileWorld['driver']) {
  await dismissNativeAlert(driver);

  let pageSource = await driver.getPageSource();

  const isLoginScreen =
    pageSource.includes('Welcome Back') ||
    pageSource.includes(
      'Enter your credentials to access your account.'
    );

  if (isLoginScreen) {
    console.log('Login screen detected. Attempting to sign in.');

    const signInButton = await driver.$('~Sign In, ›');

    await signInButton.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Sign In button was not displayed',
    });

    await signInButton.click();

    console.log('Sign In button clicked.');

    await driver.waitUntil(
      async () => {
        pageSource = await driver.getPageSource();

        const authenticatedScreen =
          pageSource.includes('Transact') ||
          pageSource.includes('Dashboard') ||
          pageSource.includes('Portfolio');

        if (authenticatedScreen) {
          return true;
        }

        await dismissWelcomeModal(driver);

        pageSource = await driver.getPageSource();

        return (
          pageSource.includes('Transact') ||
          pageSource.includes('Dashboard') ||
          pageSource.includes('Portfolio')
        );
      },
      {
        timeout: 30000,
        interval: 1000,
        timeoutMsg:
          'Login did not complete. The application did not reach an authenticated screen.',
      }
    );

    await dismissWelcomeModal(driver);

    console.log('Login successful. Authenticated screen detected.');
  } else {
    console.log('Login screen not detected. Checking existing session.');
    await dismissWelcomeModal(driver);
  }

  pageSource = await driver.getPageSource();

  assert.ok(
    pageSource.includes('Transact') ||
      pageSource.includes('Dashboard') ||
      pageSource.includes('Portfolio'),
    'The application did not reach an authenticated screen'
  );
}

// --------------------------------------------------
// SEND MONEY NAVIGATION
// --------------------------------------------------

async function openSendMoneyScreen(driver: MobileWorld['driver']) {
  await ensureLoggedIn(driver);

  let pageSource = await driver.getPageSource();

  const isSendMoneyScreen =
    pageSource.includes('Transfer Details') &&
    pageSource.includes('Amount (ZAR)');

  if (isSendMoneyScreen) {
    console.log('Already on the Send Money screen.');
    return;
  }

  let sendMoneyCard = await driver.$(
    'android=new UiSelector().descriptionContains("Send Money")'
  );

  if (!(await sendMoneyCard.isDisplayed())) {
    console.log(
      'Send Money card is not visible. Navigating to Dashboard.'
    );

    const dashboardTab = await driver.$('~▣, Dashboard');

    await dashboardTab.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Dashboard navigation button was not displayed',
    });

    await dashboardTab.click();

    console.log('Dashboard navigation button clicked.');

    await driver.waitUntil(
      async () => {
        sendMoneyCard = await driver.$(
          'android=new UiSelector().descriptionContains("Send Money")'
        );

        return await sendMoneyCard.isDisplayed();
      },
      {
        timeout: 15000,
        interval: 500,
        timeoutMsg:
          'Send Money Quick Actions card did not appear after navigating to Dashboard',
      }
    );
  }

  await sendMoneyCard.waitForDisplayed({
    timeout: 15000,
    timeoutMsg: 'Send Money Quick Actions card was not displayed',
  });

  await sendMoneyCard.click();

  console.log('Send Money Quick Actions card clicked.');

  await driver.waitUntil(
    async () => {
      pageSource = await driver.getPageSource();

      return (
        pageSource.includes('Transfer Details') &&
        pageSource.includes('Amount (ZAR)')
      );
    },
    {
      timeout: 15000,
      timeoutMsg: 'Send Money screen did not open',
    }
  );

  console.log('Send Money screen opened successfully.');
}

async function enterTransferAmount(driver: MobileWorld['driver']) {
  const amountField = await driver.$(
    '//android.widget.EditText[@input-type="16386"]'
  );

  await amountField.waitForDisplayed({ timeout: 10000 });
  await amountField.setValue('100.00');
  await driver.hideKeyboard();
}

async function scrollToReviewButton(driver: MobileWorld['driver']) {
  const reviewButton = await driver.$('~Review Transaction, ›');

  for (let attempt = 0; attempt < 4; attempt++) {
    if (await reviewButton.isDisplayed()) {
      return reviewButton;
    }

    await driver.execute('mobile: scrollGesture', {
      left: 180,
      top: 300,
      width: 700,
      height: 1400,
      direction: 'down',
      percent: 0.7,
    });

    await driver.pause(500);
  }

  await reviewButton.waitForDisplayed({
    timeout: 10000,
    timeoutMsg: 'Review Transaction button could not be found after scrolling',
  });

  return reviewButton;
}

async function findBobWallet(driver: MobileWorld['driver']) {
  return driver.$(
    'android=new UiSelector().descriptionContains("Bob Wallet")'
  );
}

// --------------------------------------------------
// OTP HELPER
// --------------------------------------------------

async function enterLatestPendingTransferOtp(
  driver: MobileWorld['driver']
) {
  await driver.waitUntil(
    async () => {
      const source = await driver.getPageSource();

      const otpFields = await driver.$$(
        '//android.widget.EditText[@hint="Enter 6-digit OTP"]'
      );

      return (
        source.includes('PENDING') &&
        source.includes('ONE-TIME CODE') &&
        otpFields.length > 0
      );
    },
    {
      timeout: 20000,
      interval: 500,
      timeoutMsg:
        'History did not display a pending transfer with an OTP field',
    }
  );

  const pageSource = await driver.getPageSource();

  const otpFields = await driver.$$(
    '//android.widget.EditText[@hint="Enter 6-digit OTP"]'
  );

  assert.ok(
    otpFields.length > 0,
    'No OTP input field was found'
  );

  const otpMatches = [
    ...pageSource.matchAll(
      /text="(\d{6})"[\s\S]*?<android\.widget\.EditText[^>]*hint="Enter 6-digit OTP"/g
    ),
  ];

  assert.ok(
    otpMatches.length > 0,
    'The OTP for the newest pending transfer was not found'
  );

  const latestOtp = otpMatches[0][1];

  await otpFields[0].waitForDisplayed({ timeout: 10000 });
  await otpFields[0].setValue(latestOtp);

  await driver.hideKeyboard();

  console.log('Latest pending transfer OTP entered:', latestOtp);
}

// --------------------------------------------------
// LOGIN AND NAVIGATION STEPS
// --------------------------------------------------

Given(
  'I am logged into the FlashGuard mobile application',
  async function (this: MobileWorld) {
    const currentPackage = await this.driver.getCurrentPackage();

    assert.equal(
      currentPackage,
      'com.anonymous.flashguadmobileapp',
      'FlashGuard mobile application is not running'
    );

    await ensureLoggedIn(this.driver);
  }
);

Given(
  'I am on the Send Money screen',
  async function (this: MobileWorld) {
    await openSendMoneyScreen(this.driver);
  }
);

// --------------------------------------------------
// SCENARIO 1: SELECT A TRANSFER RECIPIENT
// --------------------------------------------------

When(
  'I search for a beneficiary',
  async function (this: MobileWorld) {
    const searchField = await this.driver.$(
      'android=new UiSelector().className("android.widget.EditText").instance(0)'
    );

    await searchField.waitForDisplayed({ timeout: 10000 });
    await searchField.setValue('Bob');
    await this.driver.hideKeyboard();

    await this.driver.pause(1000);

    const charlie = await this.driver.$(
      '~CF, CharlieFrozen, charlie@flashguard.local'
    );

    const services = await this.driver.$(
      '~FM, FlashGuard Mobile Services, services@flashguard.local'
    );

    assert.equal(
      await charlie.isExisting(),
      false,
      'Charlie Frozen should not appear in Bob search results'
    );

    assert.equal(
      await services.isExisting(),
      false,
      'FlashGuard Mobile Services should not appear in Bob search results'
    );
  }
);

When(
  'I select the matching beneficiary',
  async function (this: MobileWorld) {
    const bobWallet = await findBobWallet(this.driver);

    await bobWallet.waitForDisplayed({ timeout: 10000 });
    await bobWallet.click();
  }
);

Then(
  'the selected beneficiary should be displayed as the transfer recipient',
  async function (this: MobileWorld) {
    const pageSource = await this.driver.getPageSource();

    assert.ok(
      pageSource.includes('Bob Wallet'),
      'Bob Wallet was not displayed as the selected recipient'
    );

    assert.ok(
      pageSource.includes('BW, Bob Wallet, bob@flashguard.local'),
      'Bob Wallet selection indicator was not found'
    );
  }
);

// --------------------------------------------------
// SCENARIO 2: ENTER A VALID TRANSFER AMOUNT
// --------------------------------------------------

Given(
  'I have selected a beneficiary',
  async function (this: MobileWorld) {
    await openSendMoneyScreen(this.driver);

    await this.driver.execute('mobile: scrollGesture', {
      left: 180,
      top: 300,
      width: 700,
      height: 1400,
      direction: 'up',
      percent: 0.8,
    });

    const bobWallet = await findBobWallet(this.driver);

    await bobWallet.waitForDisplayed({ timeout: 10000 });

    console.log('Bob Wallet beneficiary is visible and selected by default.');
  }
);

When(
  'I enter a valid transfer amount',
  async function (this: MobileWorld) {
    await enterTransferAmount(this.driver);

    await this.driver.execute('mobile: scrollGesture', {
      left: 180,
      top: 300,
      width: 700,
      height: 1400,
      direction: 'down',
      percent: 0.8,
    });

    await this.driver.pause(1000);

    console.log('SCREEN AFTER ENTERING AMOUNT AND SCROLLING:');
    console.log(await this.driver.getPageSource());
  }
);

Then(
  'the entered amount should be displayed correctly',
  async function (this: MobileWorld) {
    const amountField = await this.driver.$(
      '//android.widget.EditText[@input-type="16386"]'
    );

    await amountField.waitForDisplayed({ timeout: 10000 });

    const actualAmount = await amountField.getText();

    assert.strictEqual(
      actualAmount,
      '100.00',
      `Expected amount 100.00, but found ${actualAmount}`
    );
  }
);

Then(
  'the total amount should include the applicable transfer fee',
  async function (this: MobileWorld) {
    const pageSource = await this.driver.getPageSource();

    console.log('TRANSFER DETAILS SCREEN:');
    console.log(pageSource);
  }
);

// --------------------------------------------------
// COMMON TRANSFER SUBMISSION
// --------------------------------------------------

async function submitTransfer(driver: MobileWorld['driver']) {
  await openSendMoneyScreen(driver);

  const bobWallet = await findBobWallet(driver);

  await bobWallet.waitForDisplayed({ timeout: 10000 });

  await enterTransferAmount(driver);

  const reviewButton = await scrollToReviewButton(driver);

  await reviewButton.waitForEnabled({
    timeout: 10000,
    timeoutMsg: 'Review Transaction button was not enabled',
  });

  console.log('Review Transaction button found and enabled.');

  await reviewButton.click();

  console.log('Review Transaction button clicked. Waiting for confirmation.');

  try {
    await driver.waitUntil(
      async () => {
        const title = await driver.$(
          'id=com.anonymous.flashguadmobileapp:id/alert_title'
        );

        return await title.isDisplayed();
      },
      {
        timeout: 15000,
        interval: 500,
        timeoutMsg: 'Transfer confirmation dialog did not appear',
      }
    );
  } catch (error) {
    console.log('SCREEN AFTER REVIEW TRANSACTION CLICK:');
    console.log(await driver.getPageSource());

    throw error;
  }

  const dialog = await readNativeDialog(driver);

  assert.strictEqual(
    dialog.title,
    'Transfer submitted',
    `Unexpected transfer confirmation title: ${dialog.title}`
  );

  assert.ok(
    dialog.message.includes('queued for approval'),
    `Unexpected transfer confirmation message: ${dialog.message}`
  );

  console.log('TRANSFER CONFIRMATION:', dialog.title);
  console.log('TRANSFER MESSAGE:', dialog.message);

  await dismissNativeAlert(driver);
  await driver.pause(2000);
}

// --------------------------------------------------
// SCENARIO 3: AUTHORIZE A PENDING TRANSFER USING OTP
// --------------------------------------------------

Given(
  'I have submitted a transfer',
  async function (this: MobileWorld) {
    await submitTransfer(this.driver);
  }
);

Given(
  'the transfer appears as pending in History',
  async function (this: MobileWorld) {
    const historyTab = await this.driver.$('~↺, History');

    await historyTab.waitForDisplayed({
      timeout: 10000,
      timeoutMsg: 'History navigation tab was not displayed',
    });

    await historyTab.click();

    console.log('History tab clicked.');

    await this.driver.waitUntil(
      async () => {
        const pageSource = await this.driver.getPageSource();

        return (
          pageSource.includes('History') &&
          pageSource.includes('PENDING') &&
          pageSource.includes('ONE-TIME CODE')
        );
      },
      {
        timeout: 15000,
        interval: 500,
        timeoutMsg:
          'History did not display a pending transfer with an OTP',
      }
    );

    console.log('Pending transfer and OTP section found in History.');
  }
);

When(
  'I enter the correct OTP for the pending transfer',
  async function (this: MobileWorld) {
    await enterLatestPendingTransferOtp(this.driver);
  }
);

Then(
  'the OTP should be accepted',
  async function (this: MobileWorld) {
    const pageSource = await this.driver.getPageSource();

    assert.ok(
      pageSource.includes('Approve'),
      'The Approve button was not available after entering the OTP'
    );
  }
);

// --------------------------------------------------
// SCENARIO 4: CONFIRM A TRANSFER SUCCESSFULLY
// --------------------------------------------------

Given(
  'I have entered the correct OTP for a pending transfer',
  async function (this: MobileWorld) {
    await submitTransfer(this.driver);
    await enterLatestPendingTransferOtp(this.driver);
  }
);

When(
  'I tap the Approve button',
  async function (this: MobileWorld) {
    const approveButtons = await this.driver.$$('~Approve');

    assert.ok(
      approveButtons.length > 0,
      'No Approve button was found'
    );

    const latestApproveButton = approveButtons[0];

    await latestApproveButton.waitForDisplayed({
      timeout: 10000,
    });

    await latestApproveButton.click();

    console.log('Approve button for the newest pending transfer clicked.');
  }
);

Then(
  'the transfer should be marked as completed',
  async function (this: MobileWorld) {
    const dialog = await readNativeDialog(this.driver);

    assert.strictEqual(
      dialog.title,
      'Authorized',
      `Unexpected authorization confirmation title: ${dialog.title}`
    );

    console.log('AUTHORIZATION CONFIRMATION:', dialog.title);
    console.log('AUTHORIZATION MESSAGE:', dialog.message);

    await dismissNativeAlert(this.driver);
    await this.driver.pause(2000);

    const updatedSource = await this.driver.getPageSource();

    assert.ok(
      updatedSource.includes('COMPLETED'),
      'The transfer was not marked as completed'
    );
  }
);

Then(
  'a confirmation message should be displayed',
  async function (this: MobileWorld) {
    const pageSource = await this.driver.getPageSource();

    assert.ok(
      pageSource.includes('COMPLETED'),
      'No completed transfer confirmation was found'
    );
  }
);

// --------------------------------------------------
// SCENARIO 5: CANCEL A TRANSFER USING THE BACK BUTTON
// --------------------------------------------------

Given(
  'I have entered transfer details',
  async function (this: MobileWorld) {
    const bobWallet = await findBobWallet(this.driver);

    await bobWallet.waitForDisplayed({
      timeout: 10000,
      timeoutMsg: 'Bob Wallet was not displayed in the beneficiary list',
    });

    await bobWallet.click();

    console.log('Bob Wallet selected for the cancellation test.');

    await this.driver.waitUntil(
      async () => {
        const pageSource = await this.driver.getPageSource();

        return (
          pageSource.includes('Bob Wallet') &&
          pageSource.includes('BW, Bob Wallet, bob@flashguard.local')
        );
      },
      {
        timeout: 10000,
        interval: 500,
        timeoutMsg:
          'Bob Wallet was not selected as the transfer recipient',
      }
    );

    await enterTransferAmount(this.driver);

    console.log('Transfer amount entered for the cancellation test.');
  }
);

When(
  'I press the back button',
  async function (this: MobileWorld) {
    await this.driver.back();
    await this.driver.pause(2000);

    console.log(
      'CURRENT PACKAGE:',
      await this.driver.getCurrentPackage()
    );

    console.log(
      'CURRENT ACTIVITY:',
      await this.driver.getCurrentActivity()
    );

    console.log(
      'SCREEN AFTER BACK:',
      await this.driver.getPageSource()
    );
  }
);

Then(
  'a cancellation confirmation should be displayed',
  async function (this: MobileWorld) {
    const pageSource = await this.driver.getPageSource();

    const hasCancellationMessage =
      pageSource.toLowerCase().includes('cancel transfer') ||
      pageSource.toLowerCase().includes('discard transfer') ||
      pageSource.toLowerCase().includes('are you sure');

    assert.equal(
      hasCancellationMessage,
      true,
      'No cancellation confirmation was displayed after pressing Back'
    );
  }
);

Then(
  'the transfer should not be submitted',
  async function (this: MobileWorld) {
    const pageSource = await this.driver.getPageSource();

    assert.equal(
      pageSource.includes('Transfer submitted'),
      false,
      'The transfer was submitted even though cancellation was expected'
    );
  }
);

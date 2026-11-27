
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { strict as assert } from 'node:assert';

import { E2EWorld } from '../support/world';
import { LoginPage } from '../../../src/pages/LoginPage';
import { config } from '../../../src/support/config';
import { getBalance } from '../../ui/testData/db';

import {
  selectSender,
  selectRecipient,
  enterAmount,
  confirmTransfer,
} from '../../ui/transferMoney/transferMoney';

// --------------------------------------------------
// TEST CONSTANTS
// --------------------------------------------------

const EXPECTED_STARTING_BALANCE = 6830;
const TRANSFER_AMOUNT = 4000;
const EXPECTED_MINIMUM_PENDING_TRANSFERS = 2;

// --------------------------------------------------
// MOBILE NAVIGATION HELPERS
// --------------------------------------------------

async function tapMobileNavigation(
  driver: E2EWorld['mobileDriver'],
  label: string
) {
  const item = await driver.$(
    `android=new UiSelector().descriptionContains("${label}")`
  );

  await item.waitForDisplayed({
    timeout: 10000,
    timeoutMsg: `${label} navigation option was not found`,
  });

  await item.click();
}

async function openMobileDashboard(driver: E2EWorld['mobileDriver']) {
  await tapMobileNavigation(driver, 'Dashboard');

  await driver.waitUntil(
    async () => {
      const source = await driver.getPageSource();
      return source.includes('TOTAL NET WORTH');
    },
    {
      timeout: 15000,
      timeoutMsg: 'Mobile Dashboard was not displayed',
    }
  );
}

async function openMobileHistory(driver: E2EWorld['mobileDriver']) {
  await tapMobileNavigation(driver, 'History');

  await driver.waitUntil(
    async () => {
      const source = await driver.getPageSource();

      return (
        source.includes('History') &&
        source.includes('PENDING') &&
        source.includes('ONE-TIME CODE')
      );
    },
    {
      timeout: 20000,
      interval: 500,
      timeoutMsg:
        'Mobile History did not display the pending transfers and OTP sections',
    }
  );
}

// --------------------------------------------------
// MOBILE ALERT HELPERS
// --------------------------------------------------

async function dismissMobileAlert(driver: E2EWorld['mobileDriver']) {
  const okButton = await driver.$('id=android:id/button1');

  if (await okButton.isDisplayed()) {
    await okButton.click();
  }
}

async function readMobileDialog(driver: E2EWorld['mobileDriver']) {
  const titleElement = await driver.$(
    'id=com.anonymous.flashguadmobileapp:id/alert_title'
  );

  const messageElement = await driver.$('id=android:id/message');

  await titleElement.waitForDisplayed({
    timeout: 15000,
    timeoutMsg: 'Mobile confirmation dialog title was not displayed',
  });

  await messageElement.waitForDisplayed({
    timeout: 10000,
    timeoutMsg: 'Mobile confirmation dialog message was not displayed',
  });

  return {
    title: await titleElement.getText(),
    message: await messageElement.getText(),
  };
}

// --------------------------------------------------
// MOBILE LOGIN
// --------------------------------------------------

async function ensureMobileLoggedIn(driver: E2EWorld['mobileDriver']) {
  let source = await driver.getPageSource();

  const isLoginScreen =
    source.includes('Welcome Back') ||
    source.includes('Enter your credentials to access your account.');

  if (isLoginScreen) {
    const signInButton = await driver.$('~Sign In, ›');

    await signInButton.waitForDisplayed({
      timeout: 15000,
      timeoutMsg: 'Mobile Sign In button was not displayed',
    });

    await signInButton.click();

    await driver.waitUntil(
      async () => {
        source = await driver.getPageSource();

        return (
          source.includes('Transact') ||
          source.includes('Dashboard') ||
          source.includes('Portfolio')
        );
      },
      {
        timeout: 30000,
        interval: 1000,
        timeoutMsg: 'Mobile login did not complete',
      }
    );
  }

  source = await driver.getPageSource();

  assert.ok(
    source.includes('Transact') ||
      source.includes('Dashboard') ||
      source.includes('Portfolio'),
    'Mobile application did not reach an authenticated screen'
  );
}

// --------------------------------------------------
// MOBILE TRANSFER PREPARATION
// --------------------------------------------------

async function openMobileSendMoney(driver: E2EWorld['mobileDriver']) {
  let source = await driver.getPageSource();

  if (
    source.includes('Transfer Details') &&
    source.includes('Amount (ZAR)')
  ) {
    return;
  }

  let sendMoneyCard = await driver.$(
    'android=new UiSelector().descriptionContains("Send Money")'
  );

  if (!(await sendMoneyCard.isDisplayed())) {
    await tapMobileNavigation(driver, 'Dashboard');

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
        timeoutMsg: 'Send Money card did not appear on Mobile Dashboard',
      }
    );
  }

  await sendMoneyCard.click();

  await driver.waitUntil(
    async () => {
      source = await driver.getPageSource();

      return (
        source.includes('Transfer Details') &&
        source.includes('Amount (ZAR)')
      );
    },
    {
      timeout: 15000,
      timeoutMsg: 'Mobile Send Money screen did not open',
    }
  );
}

async function scrollToMobileReviewButton(
  driver: E2EWorld['mobileDriver']
) {
  const reviewButton = await driver.$('~Review Transaction, ›');

  for (let attempt = 0; attempt < 4; attempt++) {
    if (await reviewButton.isDisplayed()) {
      return reviewButton;
    }

    const size = await driver.getWindowSize();

    await driver.execute('mobile: scrollGesture', {
      left: 0,
      top: Math.floor(size.height * 0.25),
      width: size.width,
      height: Math.floor(size.height * 0.6),
      direction: 'down',
      percent: 0.7,
    });

    await driver.pause(500);
  }

  await reviewButton.waitForDisplayed({
    timeout: 10000,
    timeoutMsg: 'Mobile Review Transaction button was not found after scrolling',
  });

  return reviewButton;
}

// --------------------------------------------------
// OTP EXTRACTION AND APPROVAL
// --------------------------------------------------

function extractOtpValues(source: string): string[] {
  const matches = [
    ...source.matchAll(
      /text="(\d{6})"[\s\S]*?<android\.widget\.EditText[^>]*hint="Enter 6-digit OTP"/g
    ),
  ];

  return matches.map(match => match[1]);
}

async function approveOnePendingTransfer(
  driver: E2EWorld['mobileDriver']
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
      timeoutMsg: 'A pending transfer with an OTP field was not displayed',
    }
  );

  const source = await driver.getPageSource();

  const otpValues = extractOtpValues(source);

  const otpFields = await driver.$$(
    '//android.widget.EditText[@hint="Enter 6-digit OTP"]'
  );

  assert.ok(
    otpValues.length > 0,
    'Could not extract the OTP for the pending transfer'
  );

  assert.ok(
    otpFields.length > 0,
    'No pending transfer OTP input field was found'
  );

  const otp = otpValues[0];

  await otpFields[0].waitForDisplayed({ timeout: 10000 });
  await otpFields[0].setValue(otp);
  await driver.hideKeyboard();

  const approveButtons = await driver.$$('~Approve');

  assert.ok(
    approveButtons.length > 0,
    'No Approve button was found for the pending transfer'
  );

  await approveButtons[0].waitForDisplayed({ timeout: 10000 });
  await approveButtons[0].click();

  const dialog = await readMobileDialog(driver);

  assert.strictEqual(
    dialog.title,
    'Authorized',
    `Unexpected approval confirmation: ${dialog.title}`
  );

  await dismissMobileAlert(driver);

  console.log('Transfer authorization:', dialog.title);
  console.log('Authorization message:', dialog.message);

  await driver.waitUntil(
    async () => {
      const updatedSource = await driver.getPageSource();

      return updatedSource.includes('COMPLETED');
    },
    {
      timeout: 15000,
      interval: 500,
      timeoutMsg: 'Approved transfer was not marked COMPLETED',
    }
  );
}

// --------------------------------------------------
// LOGIN ON WEB AND MOBILE
// --------------------------------------------------

Given(
  'I am logged in to FlashGuard on Web and Mobile',
  async function (this: E2EWorld) {
    const loginPage = new LoginPage(this.webPage);

    await loginPage.goto();

    await loginPage.login(
      config.credentials.primary.email,
      config.credentials.primary.password
    );

    await expect(this.webPage).toHaveURL(/dashboard/);

    await ensureMobileLoggedIn(this.mobileDriver);
  }
);

// --------------------------------------------------
// VERIFY STARTING BALANCE
// --------------------------------------------------

Given(
  'the sender account {string} has an available balance of {string}',
  async function (this: E2EWorld, sender: string, balance: string) {
    const databaseBalance = Number(await getBalance(sender));

    assert.strictEqual(
      databaseBalance,
      Number(balance),
      `Expected ${sender} to have R${balance}, but the database returned R${databaseBalance}`
    );

    console.log(`Starting balance for ${sender}: R${databaseBalance}`);
  }
);

// --------------------------------------------------
// PREPARE WEB TRANSFER
// --------------------------------------------------

When(
  'I prepare a transfer of {string} from {string} to {string} on Web',
  async function (
    this: E2EWorld,
    amount: string,
    sender: string,
    recipient: string
  ) {
    await this.webPage.goto('/transfers');

    await selectSender(this.webPage, sender);
    await selectRecipient(this.webPage, recipient);
    await enterAmount(this.webPage, amount);

    console.log(`Web transfer prepared: R${amount} to ${recipient}`);
  }
);

// --------------------------------------------------
// PREPARE MOBILE TRANSFER
// --------------------------------------------------

When(
  'I prepare a transfer of {string} from {string} to {string} on Mobile',
  async function (
    this: E2EWorld,
    amount: string,
    sender: string,
    recipient: string
  ) {
    const driver = this.mobileDriver;

    await openMobileSendMoney(driver);

    const recipientCard = await driver.$(
      `android=new UiSelector().descriptionContains("${recipient}")`
    );

    await recipientCard.waitForDisplayed({
      timeout: 10000,
      timeoutMsg: `${recipient} was not displayed on Mobile`,
    });

    await recipientCard.click();

    const amountField = await driver.$(
      '//android.widget.EditText[@input-type="16386"]'
    );

    await amountField.waitForDisplayed({ timeout: 10000 });
    await amountField.setValue(amount);

    await driver.hideKeyboard();

    console.log(`Mobile transfer prepared: R${amount} to ${recipient}`);
  }
);

// --------------------------------------------------
// SUBMIT BOTH TRANSFERS CONCURRENTLY
// --------------------------------------------------

When(
  'I submit both prepared transfers concurrently',
  async function (this: E2EWorld) {
    const reviewButton = await scrollToMobileReviewButton(
      this.mobileDriver
    );

    await reviewButton.waitForEnabled({
      timeout: 10000,
      timeoutMsg: 'Mobile Review Transaction button was not enabled',
    });

    await Promise.all([
      confirmTransfer(this.webPage),
      reviewButton.click(),
    ]);

    const mobileDialog = await readMobileDialog(this.mobileDriver);

    assert.strictEqual(
      mobileDialog.title,
      'Transfer submitted',
      `Unexpected Mobile submission confirmation: ${mobileDialog.title}`
    );

    assert.ok(
      mobileDialog.message.includes('queued for approval'),
      `Unexpected Mobile submission message: ${mobileDialog.message}`
    );

    await dismissMobileAlert(this.mobileDriver);

    console.log('Web and Mobile transfer submissions were triggered.');
  }
);

// --------------------------------------------------
// VERIFY BOTH TRANSFERS ARE PENDING
// --------------------------------------------------

Then(
  'both transfers should appear as pending in Mobile Transaction History',
  async function (this: E2EWorld) {
    const driver = this.mobileDriver;

    await openMobileHistory(driver);

    await driver.waitUntil(
      async () => {
        const source = await driver.getPageSource();

        const otpFields = await driver.$$(
          '//android.widget.EditText[@hint="Enter 6-digit OTP"]'
        );

        return (
          source.includes('PENDING') &&
          otpFields.length >= EXPECTED_MINIMUM_PENDING_TRANSFERS
        );
      },
      {
        timeout: 20000,
        interval: 500,
        timeoutMsg:
          'Two pending transfers with OTP fields were not displayed in Mobile History',
      }
    );

    const source = await driver.getPageSource();

    const otpFields = await driver.$$(
      '//android.widget.EditText[@hint="Enter 6-digit OTP"]'
    );

    const otpValues = extractOtpValues(source);

    assert.ok(
      otpFields.length >= EXPECTED_MINIMUM_PENDING_TRANSFERS,
      `Expected at least two pending OTP fields, found ${otpFields.length}`
    );

    assert.ok(
      otpValues.length >= EXPECTED_MINIMUM_PENDING_TRANSFERS,
      `Expected at least two OTP values, found ${otpValues.length}`
    );

    console.log('Pending OTP fields found:', otpFields.length);
    console.log('Pending OTP values found:', otpValues.length);
  }
);

// --------------------------------------------------
// APPROVE BOTH PENDING TRANSFERS
// --------------------------------------------------

When(
  'I approve both pending transfers using their respective OTPs on Mobile',
  async function (this: E2EWorld) {
    const driver = this.mobileDriver;

    await approveOnePendingTransfer(driver);

    // Wait for the History list to refresh before processing the next transfer.
    await driver.pause(1000);

    await approveOnePendingTransfer(driver);

    console.log('Both pending transfers have been processed for approval.');
  }
);

// --------------------------------------------------
// VERIFY TRANSFER OUTCOMES
// --------------------------------------------------

Then(
  'the system should prevent the combined transfers from exceeding the available balance',
  async function (this: E2EWorld) {
    const source = await this.mobileDriver.getPageSource();

    const completedCount = (
      source.match(/text="COMPLETED"/g) || []
    ).length;

    const pendingCount = (
      source.match(/text="PENDING"/g) || []
    ).length;

    const rejectedCount = (
      source.match(/text="REJECTED"/g) || []
    ).length;

    console.log('Transaction statuses after approval:');
    console.log('Completed:', completedCount);
    console.log('Pending:', pendingCount);
    console.log('Rejected:', rejectedCount);

    // The two transfers total R8,000, which is greater than
    // Alice's available balance of R6,830.
    assert.ok(
      completedCount < 2,
      'DEFECT: Both R4,000 transfers were completed even though their combined amount exceeded the available balance'
    );
  }
);

Then(
  'the sender account balance should not be negative',
  async function (this: E2EWorld) {
    const finalBalance = Number(await getBalance('Alice Ledger'));

    console.log('Alice Ledger final database balance:', finalBalance);

    assert.ok(
      finalBalance >= 0,
      `DEFECT: Alice Ledger has a negative balance of R${finalBalance}`
    );
  }
);

Then(
  'the transaction records should reflect the correct transfer outcomes',
  async function (this: E2EWorld) {
    const source = await this.mobileDriver.getPageSource();

    const completedCount = (
      source.match(/text="COMPLETED"/g) || []
    ).length;

    const rejectedCount = (
      source.match(/text="REJECTED"/g) || []
    ).length;

    assert.ok(
      completedCount + rejectedCount >= 2,
      'The expected transfer outcomes were not displayed in Mobile History'
    );

    console.log('Final displayed transaction outcomes:');
    console.log('Completed:', completedCount);
    console.log('Rejected:', rejectedCount);
  }
);

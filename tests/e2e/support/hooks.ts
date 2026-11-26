import {
  BeforeAll,
  AfterAll,
  Before,
  After,
  setDefaultTimeout,
} from '@cucumber/cucumber';

import { chromium } from '@playwright/test';
import { remote } from 'webdriverio';

import type { E2EWorld } from './world';
import { config } from '../../../src/support/config';

setDefaultTimeout(120_000);

let webBrowser: Awaited<ReturnType<typeof chromium.launch>>;

BeforeAll(async function () {
  webBrowser = await chromium.launch({
    headless: true,
  });
});

Before(async function (this: E2EWorld) {
  // Start Playwright Web session.
  this.webBrowser = webBrowser;

  this.webContext = await webBrowser.newContext({
    baseURL: config.baseURL,
  });

  this.webPage = await this.webContext.newPage();

  // Start native Android Appium session.
  this.mobileDriver = await remote({
    hostname: '127.0.0.1',
    port: 4723,
    path: '/',
    logLevel: 'warn',
    connectionRetryTimeout: 120_000,
    connectionRetryCount: 1,

    capabilities: {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'Android Emulator',
      'appium:udid': 'emulator-5554',
      'appium:appPackage': 'com.anonymous.flashguadmobileapp',
      'appium:appActivity': '.MainActivity',
      'appium:noReset': true,
      'appium:uiautomator2ServerLaunchTimeout': 60_000,
      'appium:adbExecTimeout': 60_000,
      'appium:androidInstallTimeout': 90_000,
      'appium:disableWindowAnimation': true,
      'appium:newCommandTimeout': 120,
    },
  });
});

After(async function (this: E2EWorld) {
  // Close both sessions, even if one cleanup fails.
  try {
    if (this.mobileDriver) {
      await this.mobileDriver.deleteSession();
    }
  } finally {
    await this.webContext?.close();
  }
});

AfterAll(async function () {
  await webBrowser?.close();
});
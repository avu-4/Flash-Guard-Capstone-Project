import { Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
 
import { LoginPage } from '../auth_pages/LoginPage';
import type { MobileWorld } from '../auth_support/world';
 
// Initialise LoginPage using the active Appium session.
function getLoginPage(world: MobileWorld): LoginPage {
  assert.ok(
    world.driver,
    'Appium driver has not been initialised'
  );
 
  return new LoginPage(world.driver);
}
 
// TC-MOB-AUTH-001: Verify welcome heading.
Then(
  'the welcome heading should be visible',
  async function (this: MobileWorld) {
    const page = getLoginPage(this);
 
    assert.equal(
      await page.isVisible(page.welcomeHeading),
      true,
      'Welcome Back heading should be visible'
    );
  }
);
 
// Verify email input field.
Then(
  'the email field should be visible',
  async function (this: MobileWorld) {
    const page = getLoginPage(this);
 
    assert.equal(
      await page.isVisible(page.emailField),
      true,
      'Email / ID Number field should be visible'
    );
  }
);
 
// Verify password input field.
Then(
  'the password field should be visible',
  async function (this: MobileWorld) {
    const page = getLoginPage(this);
 
    assert.equal(
      await page.isVisible(page.passwordField),
      true,
      'Password field should be visible'
    );
  }
);
 
// Verify Sign In button.
Then(
  'the sign in button should be visible',
  async function (this: MobileWorld) {
    const page = getLoginPage(this);
 
    assert.equal(
      await page.isVisible(page.signInButton),
      true,
      'Sign In button should be visible'
    );
  }
);
 
// Verify Forgot Password link.
Then(
  'the forgot password link should be visible',
  async function (this: MobileWorld) {
    const page = getLoginPage(this);
 
    assert.equal(
      await page.isVisible(page.forgotPasswordLink),
      true,
      'Forgot Password link should be visible'
    );
  }
);
 
// Verify Create an Account link.
Then(
  'the create account link should be visible',
  async function (this: MobileWorld) {
    const page = getLoginPage(this);
 
    assert.equal(
      await page.isVisible(page.createAccountLink),
      true,
      'Create an Account link should be visible'
    );
  }
);
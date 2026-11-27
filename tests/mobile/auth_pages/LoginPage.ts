import type { MobileDriver } from '../auth_support/world';

export class LoginPage {
  constructor(private driver: MobileDriver) {}

  // Login screen elements
  get welcomeHeading() {
    return '//*[@text="Welcome Back"]';
  }

  get emailField() {
    return '//android.widget.EditText[1]';
  }

  get passwordField() {
    return '//android.widget.EditText[2]';
  }

  get signInButton() {
    return '//*[@content-desc="Sign In, ›"]';
  }

  // Successful login dialog
  get welcomeDialogOkButton() {
    return '//*[@text="OK"]';
  }

  // Dashboard element
  get dashboardNetWorthHeading() {
    return '//*[@text="TOTAL NET WORTH"]';
  }

  // Unsuccessful login dialog
  get loginFailedTitle() {
    return '//*[@text="Login failed"]';
  }

  get invalidCredentialsMessage() {
    return '//*[@text="Invalid credentials"]';
  }

  get errorDialogOkButton() {
    return '//*[@text="OK"]';
  }

  // Check whether an element is visible.
  async isVisible(selector: string): Promise<boolean> {
    const element = await this.driver.$(selector);

    await element.waitForDisplayed({
      timeout: 15000,
      interval: 500,
      timeoutMsg: `Element was not visible: ${selector}`
    });

    return element.isDisplayed();
  }

  // Verify the login screen.
  async verifyLoginScreen(): Promise<void> {
    const elements = [
      ['Welcome heading', this.welcomeHeading],
      ['Email field', this.emailField],
      ['Password field', this.passwordField],
      ['Sign In button', this.signInButton]
    ] as const;

    for (const [name, selector] of elements) {
      await this.isVisible(selector);
      console.log(`${name} is visible.`);
    }
  }

  // Enter email address.
  async enterEmail(email: string): Promise<void> {
    const field = await this.driver.$(this.emailField);

    await field.waitForDisplayed({
      timeout: 15000
    });

    await field.setValue(email);
  }

  // Enter password.
  async enterPassword(password: string): Promise<void> {
    const field = await this.driver.$(this.passwordField);

    await field.waitForDisplayed({
      timeout: 15000
    });

    await field.setValue(password);
  }

  // Submit login form.
  async tapSignIn(): Promise<void> {
    const button = await this.driver.$(this.signInButton);

    await button.waitForDisplayed({
      timeout: 15000
    });

    await button.click();

    console.log('Login form submitted.');
  }

  // Dismiss successful login welcome dialog.
  async tapWelcomeDialogOk(): Promise<void> {
    const okButton = await this.driver.$(
      this.welcomeDialogOkButton
    );

    await okButton.waitForDisplayed({
      timeout: 15000,
      interval: 500,
      timeoutMsg: 'Welcome-back dialog OK button was not visible'
    });

    await okButton.click();

    console.log('Welcome-back dialog dismissed.');
  }

  // Verify dashboard after successful login.
  async verifyDashboard(): Promise<void> {
    await this.isVisible(this.dashboardNetWorthHeading);

    console.log('FlashGuard dashboard is displayed.');
  }

  // Verify unsuccessful login alert.
  async verifyAuthenticationError(): Promise<void> {
    await this.isVisible(this.loginFailedTitle);

    console.log('Login failed alert title is visible.');

    await this.isVisible(this.invalidCredentialsMessage);

    console.log('Invalid credentials message is visible.');
  }

  // Dismiss unsuccessful login alert.
  async dismissAuthenticationError(): Promise<void> {
    const okButton = await this.driver.$(
      this.errorDialogOkButton
    );

    await okButton.waitForDisplayed({
      timeout: 15000,
      interval: 500,
      timeoutMsg: 'Authentication error OK button was not visible'
    });

    await okButton.click();

    console.log('Authentication error dialog dismissed.');
  }
}

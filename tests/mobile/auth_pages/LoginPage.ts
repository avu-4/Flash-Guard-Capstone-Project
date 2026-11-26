import type { MobileDriver } from '../auth_support/world';
 
export class LoginPage {
  constructor(private driver: MobileDriver) {}
 
  // PrimeFin SA branding
  get brand() {
    return '//*[@text="PrimeFin SA"]';
  }
 
  // Welcome heading
  get welcomeHeading() {
    return '//*[@text="Welcome Back"]';
  }
 
  // Login input fields
  get emailField() {
    return '//android.widget.EditText[1]';
  }
 
  get passwordField() {
    return '//android.widget.EditText[2]';
  }
 
  // Login button
  get signInButton() {
    return '~Sign In, ›';
  }
 
  // Forgot password navigation
  get forgotPasswordLink() {
    return '~Forgot Password?';
  }
 
  // Create account navigation
  get createAccountLink() {
    return '~Create an Account';
  }
 
  // Reusable visibility verification
  async isVisible(selector: string): Promise<boolean> {
    const element = this.driver.$(selector);
 
    await element.waitForDisplayed({
      timeout: 10000,
      interval: 500,
      timeoutMsg: `Element was not visible: ${selector}`
    });
 
    return element.isDisplayed();
  }
 
  // Enter email address
  async enterEmail(email: string): Promise<void> {
    const field = this.driver.$(this.emailField);
 
    await field.waitForDisplayed({ timeout: 10000 });
    await field.setValue(email);
  }
 
  // Enter password
  async enterPassword(password: string): Promise<void> {
    const field = this.driver.$(this.passwordField);
 
    await field.waitForDisplayed({ timeout: 10000 });
    await field.setValue(password);
  }
 
  // Tap Sign In
  async tapSignIn(): Promise<void> {
    const button = this.driver.$(this.signInButton);
 
    await button.waitForDisplayed({ timeout: 10000 });
    await button.click();
  }
}
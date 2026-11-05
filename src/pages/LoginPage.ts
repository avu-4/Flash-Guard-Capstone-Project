import { expect, Page } from '@playwright/test';
 
export class LoginPage {
  constructor(private readonly page: Page) {}
 
  /**
   * Navigate to the login page and verify that it loads.
   */
  async goto(): Promise<void> {
    await this.page.goto('/login');
 
    await expect(
      this.page.getByRole('textbox', { name: 'Email address' })
    ).toBeVisible();
  }
 
  /**
   * Enter the supplied credentials and submit the login form.
   */
  async login(email: string, password: string): Promise<void> {
    await this.page
      .getByRole('textbox', { name: 'Email address' })
      .fill(email);
 
    await this.page
      .getByLabel('Password')
      .fill(password);
 
    await this.page
      .getByRole('button', { name: 'Sign In' })
      .click();
  }
 
  /**
   * Submit the login form without entering an email address.
   */
  async submitWithoutEmail(): Promise<void> {
    await this.page
      .getByLabel('Password')
      .fill('');
 
    await this.page
      .getByRole('button', { name: 'Sign In' })
      .click();
  }
 
  /**
   * Submit the login form without entering a password.
   */
  async submitWithoutPassword(): Promise<void> {
    await this.page
      .getByRole('textbox', { name: 'Email address' })
      .fill('test@example.com');
 
    await this.page
      .getByRole('button', { name: 'Sign In' })
      .click();
  }
 
  /**
   * Verify that the email field is marked as required and empty.
   */
  async expectRequiredEmailError(): Promise<void> {
    const emailInput = this.page.getByRole('textbox', {
      name: 'Email address',
    });
 
    await expect
      .poll(() =>
        emailInput.evaluate(
          (element: HTMLInputElement) =>
            element.validity.valueMissing
        )
      )
      .toBe(true);
  }
 
  /**
   * Verify that the password field is marked as required and empty.
   */
  async expectRequiredPasswordError(): Promise<void> {
    const passwordInput = this.page.getByLabel('Password');
 
    await expect
      .poll(() =>
        passwordInput.evaluate(
          (element: HTMLInputElement) =>
            element.validity.valueMissing
        )
      )
      .toBe(true);
  }
 
  /**
   * Verify that the email field rejects an invalid email format.
   * Example: aliceflashguard.local
   */
  async expectInvalidEmailFormat(): Promise<void> {
    const emailInput = this.page.getByRole('textbox', {
      name: 'Email address',
    });
 
    await expect
      .poll(() =>
        emailInput.evaluate(
          (element: HTMLInputElement) =>
            element.validity.typeMismatch
        )
      )
      .toBe(true);
  }
 
  /**
   * Verify that the application displays the invalid credentials message.
   */
  async expectInvalidCredentials(): Promise<void> {
    await expect(
      this.page.getByText('Invalid credentials', { exact: true })
    ).toBeVisible();
  }
 
  /**
   * Verify that the user remains on the login page.
   */
  async expectLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login(?:[?#].*)?$/);
 
    await expect(
      this.page.getByRole('textbox', { name: 'Email address' })
    ).toBeVisible();
  }
}
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { FlashWorld } from '../../../../src/support/world';
import { config } from '../../../../src/support/config';


// ============================================================
// SECTION 1: LOGIN PAGE NAVIGATION
// ============================================================

// Navigate to the Flash-Guard login page.
Given(
  'I am on the Flash-Guard login page',
  async function (this: FlashWorld) {
    await this.loginPage.goto();
  }
);


// ============================================================
// SECTION 2: SUCCESSFUL AUTHENTICATION (AUTH-001 & AUTH-002)
// ============================================================

// Reusable login step for User A and User B.
When(
  'I log in with a valid account {string}',
  async function (this: FlashWorld, user: string) {
    let email: string;
    let password: string;

    const account = user.trim().toUpperCase();

    if (account === 'USER A' || account === 'PRIMARY') {
      email = config.credentials.primary.email;
      password = config.credentials.primary.password;

    } else if (account === 'USER B' || account === 'SECONDARY') {
      email = config.credentials.secondary.email;
      password = config.credentials.secondary.password;

    } else {
      throw new Error(`Unknown test account: ${user}`);
    }

    await this.loginPage.login(email, password);
  }
);


// Verify that authentication was successful.
Then(
  'I should be authenticated successfully',
  async function (this: FlashWorld) {
    await expect(this.page).toHaveURL('/dashboard');
  }
);


// Verify that the portfolio dashboard is displayed.
Then(
  'I should see the portfolio dashboard',
  async function (this: FlashWorld) {
    await expect(
      this.page.getByRole('heading', {
        name: 'Portfolio Overview',
      })
    ).toBeVisible();
  }
);


// ============================================================
// SECTION 3: UNSUCCESSFUL AUTHENTICATION (AUTH-003 & AUTH-004)
// ============================================================

// Attempt to log in using a registered email and incorrect password.
When(
  'I submit a registered email with an incorrect password',
  async function (this: FlashWorld) {
    await this.loginPage.login(
      config.credentials.primary.email,
      'DeliberatelyIncorrect-Test-Password!'
    );
  }
);


// Attempt to log in using an unregistered email and password.
When(
  'I submit an unregistered email and password',
  async function (this: FlashWorld) {
    await this.loginPage.login(
      'unregistered-test-user@example.invalid',
      'Invalid-Test-Password!'
    );
  }
);


// Verify that the application rejects the supplied credentials.
Then(
  'authentication should be rejected',
  async function (this: FlashWorld) {
    await expect(
      this.page.getByText('Invalid credentials').first()
    ).toBeVisible();
  }
);


// Verify that the user cannot access the protected dashboard.
Then(
  'I should remain outside the protected dashboard',
  async function (this: FlashWorld) {
    await expect(this.page).not.toHaveURL('/dashboard');
  }
);


// ============================================================
// SECTION 4: REUSABLE AUTHENTICATED SETUP
// ============================================================

// Authenticate using the primary test account.
// Reused by AUTH-005 and AUTH-006.
Given(
  'I am authenticated with a valid account',
  async function (this: FlashWorld) {
    await this.loginPage.goto();

    await this.loginPage.login(
      config.credentials.primary.email,
      config.credentials.primary.password
    );

    await expect(this.page).toHaveURL('/dashboard');
  }
);


// ============================================================
// SECTION 5: AUTH-005 — EXPIRED SESSION
// ============================================================

// Simulate an expired session by clearing browser authentication data.
Given(
  'my session has expired',
  async function (this: FlashWorld) {
    await this.context.clearCookies();

    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
);


// Navigate directly to the protected dashboard.
When(
  'I navigate to the protected dashboard',
  async function (this: FlashWorld) {
    await this.page.goto('/dashboard');
  }
);


// ============================================================
// SECTION 6: REUSABLE LOGIN REDIRECTION VERIFICATION
// Used by AUTH-005 and AUTH-006
// ============================================================

// Verify that the user has been redirected to the login page.
Then(
  'I should be redirected to the login page',
  async function (this: FlashWorld) {
    await expect(this.page).toHaveURL('/login');

    await expect(
      this.page.getByRole('link', {
        name: 'Back to landing',
      })
    ).toBeVisible();

    await expect(
      this.page.getByRole('textbox', {
        name: 'Email address',
      })
    ).toBeVisible();
  }
);


// ============================================================
// SECTION 7: AUTH-005 — PROTECTED ACCOUNT INFORMATION
// ============================================================

// Verify that protected account information is not displayed.
Then(
  'I should not see protected account information',
  async function (this: FlashWorld) {
    await expect(
      this.page.getByRole('heading', {
        name: 'Portfolio Overview',
      })
    ).not.toBeVisible();
  }
);


// ============================================================
// SECTION 8: AUTH-006 — LOGOUT AND REAUTHENTICATION
// ============================================================

// Log out of the authenticated Flash-Guard account.
When(
  'I log out',
  async function (this: FlashWorld) {
    await this.page
      .getByRole('link', {
        name: 'logout Sign Out',
      })
      .click();
  }
);


// Attempt to access the protected dashboard after logout.
Then(
  'I should not be able to access the protected dashboard',
  async function (this: FlashWorld) {

    // Attempt to navigate directly to the protected dashboard.
    await this.page.goto('/dashboard');

    // Verify that the user is redirected to the login page.
    await expect(this.page).toHaveURL('/login');

    // Verify that the login form is visible.
    await expect(
      this.page.getByRole('textbox', {
        name: 'Email address',
      })
    ).toBeVisible();

    // Verify that protected dashboard information is not visible.
    await expect(
      this.page.getByRole('heading', {
        name: 'Portfolio Overview',
      })
    ).not.toBeVisible();
  }
);





@authentication

Feature: FlashGuard mobile authentication

  As a registered FlashGuard user
  I want to authenticate using my credentials
  So that I can securely access my account

  @P0 @positive @TC_MOB_AUTH_001
  Scenario: TC-MOB-AUTH-001 - Successful login using valid email and password
    Given the mobile login screen is displayed
    When the user enters valid credentials
    And the user taps the sign in button
    Then the dashboard should be displayed

  @P0 @negative @TC_MOB_AUTH_002
  Scenario: TC-MOB-AUTH-002 - Unsuccessful login using invalid credentials
    Given the mobile login screen is displayed
    When the user enters invalid credentials
    And the user taps the sign in button
    Then an authentication error should be displayed

  @P0 @exploratory @TC_MOB_AUTH_004
  Scenario: TC-MOB-AUTH-004 - Observe authentication state after backgrounding and reopening the app
    Given the mobile login screen is displayed
    When the user enters valid credentials
    And the user taps the sign in button
    Then the dashboard should be displayed
    When the app is sent to the background for five minutes and reopened
    Then the reopened app authentication state should be recorded

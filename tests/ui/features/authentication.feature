@authentication @P0
Feature: Flash-Guard authentication
  As a registered Flash-Guard user
  I want to authenticate securely
  So that I can access only the features authorised for my account

  Background:
    Given I am on the Flash-Guard login page

  @T-UI-AUTH-001 @smoke @positive
  Scenario: Login with first registered user A
    When I log in with a valid account "primary"
    Then I should be authenticated successfully
    And I should see the portfolio dashboard

  @T-UI-AUTH-002 @e2e @positive
  Scenario: Login with a second registered user B
    When I log in with a valid account "secondary"
    Then I should be authenticated successfully
    And I should see the portfolio dashboard

  @T-UI-AUTH-003 @negative
  Scenario: Reject a valid email with an incorrect password
    When I submit a registered email with an incorrect password
    Then authentication should be rejected
    And I should remain outside the protected dashboard

  @T-UI-AUTH-004 @negative
  Scenario: Reject invalid credentials
    When I submit an unregistered email and password
    Then authentication should be rejected
    And I should remain outside the protected dashboard

  @T-UI-AUTH-005 @functional @e2e
  Scenario: An expired session cannot access protected pages
    Given I am authenticated with a valid account
    And my session has expired
    When I navigate to the protected dashboard
    Then I should be redirected to the login page
    And I should not see protected account information

  @T-UI-AUTH-006 @functional @e2e
  Scenario: Logout and log in again
    Given I am authenticated with a valid account
    When I log out
    Then I should be redirected to the login page
    And I should not be able to access the protected dashboard
    When I log in with a valid account "USER A"
    Then I should be authenticated successfully

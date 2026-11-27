@dashboard @regression
Feature: Dashboard Management
  As a FlashGuard merchant
  I want to view my account information and recent transactions
  So that I can monitor my account balance, status, and activity

  @smoke @performance
  Scenario: T-UI-DASH-001 Dashboard loads within 2 seconds
    Given the user is on the dashboard page
    When the dashboard finishes loading
    Then the dashboard should load within 2 seconds

  @smoke @account-balance
  Scenario: T-UI-DASH-002 Account balance is displayed correctly and consistently
    Given the user is on the dashboard page
    Then the account balance should be displayed in a valid Rand format
    And the account balance should be the same after refreshing


  @smoke @profile
  Scenario: T-UI-DASH-003 Account and profile information is displayed
    Given the user is on the dashboard page
    Then the logged-in user name should be displayed
    And the account information should be displayed

  @transactions
  Scenario: T-UI-DASH-004 Dashboard displays recent transactions newest first
    Given the user is on the dashboard page
    Then the dashboard should display at most 10 recent transactions newest first

  @smoke @layout
  Scenario: T-UI-DASH-005 Dashboard displays all main sections
    Given the user is on the dashboard page
    Then the dashboard should display all main sections

  @data-presence
  Scenario: T-UI-DASH-006 Dashboard does not show broken values
    Given the user is on the dashboard page
    Then the dashboard should not show broken values

  @smoke @profile
  Scenario: T-UI-DASH-007 Logged-in user name is displayed
    Given the user is on the dashboard page
    Then the logged-in user name should be displayed

  @transactions @navigation
  Scenario: T-UI-DASH-008 View All opens the Transaction History page
    Given the user is on the dashboard page
    When the user clicks the View All link
    Then the Transaction History page should be displayed

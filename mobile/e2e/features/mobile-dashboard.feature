@mobile @android @mobile-dashboard @regression
Feature: Mobile Dashboard

  As a FlashGuard Android user
  I want to view my dashboard, recent transactions
  and refreshed balance
  So that I can monitor my finances on the go

  Background:
    Given the user is signed in on the Android device

  @p0 @smoke @layout @T-MOB-DASH-001
  Scenario: Verify dashboard layout and balance display
    Then the dashboard title is displayed
    And the total net worth is shown in a valid Rand format
    And the pending card is displayed
    And the quick actions Buy Airtime, Send Money and Pay Bills are displayed
    And the spending summary section is displayed
    And the bottom navigation tabs are displayed
    And the dashboard fits the screen width without sideways scrolling
    And no broken values such as undefined or NaN are shown

  @p0 @transactions @scrolling @pagination @T-MOB-DASH-002
   @p0 @transactions @scrolling @pagination @T-MOB-DASH-002
  Scenario: Verify recent transactions and pagination
    When the user scrolls down to the Recent Transactions section
    Then at least one transaction is visible
    And the transactions are listed newest first
    When the user scrolls to the end of the dashboard
    Then the View All control is reachable
    When the user taps the View All control
    Then the full transaction history should be displayed
    And additional transactions load if a pagination control is present

  @p0 @refresh @T-MOB-DASH-003
  Scenario: Verify dashboard balance refresh
    Given the user notes the current balance
    When the user refreshes the balance
    Then the dashboard still shows the total net worth
    And the balance remains consistent after refresh
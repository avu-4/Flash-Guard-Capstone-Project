
Feature: Mobile Balance and Transaction History
  As a FlashGuard user
  I want to view my account balance and transaction history
  So that I can monitor my financial activity

  @mobile @balance @P0
  Scenario: Display the current account balance
    Given I am logged into the FlashGuard mobile application
    When I open the Dashboard
    Then my current account balance should be displayed
    And the displayed balance should match the account balance in the database

  @mobile @history @P0 @defect
  Scenario: Display transaction history and load more records
    Given I am logged into the FlashGuard mobile application
    And I am on the History screen
    When I scroll to the bottom of the transaction list
    Then additional transactions should be loaded

  @mobile @history @P0
  Scenario: Filter transaction history
    Given I am on the History screen
    When I select the Pending filter
    Then only pending transactions should be displayed
    When I select the Completed filter
    Then only completed transactions should be displayed

  @mobile @history @P0 @defect
  Scenario: Export or share a transaction screenshot
    Given I am on the History screen
    When I select the option to export or share a transaction screenshot
    Then the transaction screenshot should be available for sharing

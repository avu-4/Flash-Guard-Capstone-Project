@notifications @regression
Feature: Notifications and Alerts Management
  As a FlashGuard user
  I want to receive and view real-time notifications and system feedback
  So that I am informed about account transfers, security events, and operational errors

  Background:
    Given the application has seeded notification data
    And the user is on the dashboard page

  @smoke @p1 @functional @notifications-list
  Scenario: T-UI-NA-001 In-app transfer success notification is visible
    When the user makes a successful transfer
    And the user opens the notifications panel
    Then a notification containing "success" should be visible

  @smoke @p1 @functional @security
  Scenario: T-UI-NA-002 In-app security alert is visible
    When the user opens the notifications panel
    Then a notification containing "alert" should be visible

  @p1 @negative @error-handling
  Scenario: T-UI-NA-003 Error feedback is shown for a failed transfer
    When the user submits a failed transfer
    Then an error notification containing "Invalid transfer payload" should be visible
    And the error notification should not expose technical details

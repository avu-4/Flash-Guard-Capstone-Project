Feature: Notification Permissions

  As a registered FlashGuard user
  I want to control notification permissions
  So that I can choose whether to receive push notifications

  @P1 @Android @TC-MOB-009
  Scenario Outline: TC-MOB-009 - Verify notification permissions

    Given the FlashGuard notification permission is reset
    And the user has launched the FlashGuard application
    And the notification permission prompt is displayed

    When the user selects "<permission>"
    Then the notification permission status should be "<status>"

    When the user is logged in with valid credentials
    And the Dashboard is displayed
    And the user places the application in the background
    And a transfer alert is triggered

    Then the notification delivery result should be "<result>"

    Examples:
      | permission  | status  | result        |
      | Allow       | Granted | Received      |
      | Don't allow | Denied  | Not displayed |
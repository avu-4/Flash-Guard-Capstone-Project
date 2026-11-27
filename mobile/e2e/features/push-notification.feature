Feature: Push Notification - Transfer Alert

  As a registered FlashGuard user
  I want to receive push notifications for transfer alerts
  So that I can monitor activity on my account

  @P1 @Android @TC-MOB-007
  Scenario: TC-MOB-007 - Receive a transfer alert notification

    Given the user has launched the FlashGuard application
    And the user is logged in with valid credentials
    And the Dashboard is displayed
    And notification permissions are granted

    When the user places the application in the background
    And a transfer alert is triggered

    Then a push notification should be received
    And the notification should be displayed in the notification panel
    And the notification should contain the transfer alert information
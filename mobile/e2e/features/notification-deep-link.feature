Feature: Notification Deep Link

  As a registered FlashGuard user
  I want to open transfer details directly from a notification
  So that I can quickly review the relevant transaction

  @P1 @Android @TC-MOB-008
  Scenario: TC-MOB-008 - Open transfer details from a notification

    Given the user has launched the FlashGuard application
    And the user is logged in with valid credentials
    And the Dashboard is displayed
    And notification permissions are granted
    And the user has received a transfer alert notification

    When the user opens the notification panel
    And the user taps the transfer alert notification

    Then the FlashGuard application should open
    And the relevant transfer detail page should be displayed
    And the transfer details should match the notification
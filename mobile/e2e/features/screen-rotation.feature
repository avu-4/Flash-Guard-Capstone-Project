Feature: Screen Rotation

  As a registered FlashGuard user
  I want to rotate my device between portrait and landscape
  So that I can use the application in different screen orientations
  without losing my current application state

  Scenario: TC-MOB-005 - Successfully rotate the screen

    Given the user has launched the FlashGuard application
    And the user is logged in with valid credentials
    And the Dashboard is displayed
    And the screen is in portrait orientation
    And the screen height is greater than the screen width

    When the user rotates the device to landscape orientation
    Then the screen orientation should be landscape
    And the screen width should be greater than the screen height
    And the Dashboard should remain displayed

    When the user rotates the device back to portrait orientation
    Then the screen orientation should be portrait
    And the Dashboard should remain displayed
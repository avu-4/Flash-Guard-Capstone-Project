Feature: Different Device Sizes

  As a registered FlashGuard user
  I want the application to support different device sizes
  So that key interface elements remain visible
  and within the screen boundaries

  Scenario: TC-MOB-006 - Verify layout on different device sizes

    Given the user has launched the FlashGuard application
    And the user is logged in with valid credentials
    And the Dashboard is displayed

    When the device screen dimensions are recorded
    Then the Dashboard should be visible
    And the quick action button should be visible
    And the carousel should be visible
    And the key elements should remain within the screen boundaries
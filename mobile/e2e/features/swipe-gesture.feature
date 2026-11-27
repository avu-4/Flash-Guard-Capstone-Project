Feature: Swipe Gesture

  As a registered FlashGuard user
  I want to swipe left and right on the carousel
  So that I can view different carousel items

  Scenario: TC-MOB-003 - Successfully perform swipe gestures

    Given the user has launched the FlashGuard application
    And the user is logged in with valid credentials
    And the Dashboard is displayed
    And the carousel is displayed
    And the current carousel item is recorded

    When the user swipes left on the carousel
    Then a different carousel item should be displayed

    When the user swipes right on the carousel
    Then the original carousel item should be displayed
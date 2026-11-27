Feature: Tap and Long-Press

  As a registered FlashGuard user
  I want to perform tap and long-press gestures
  So that I can interact with application elements
  and access contextual options

  Scenario: TC-MOB-004 - Successfully perform tap and long-press gestures

    Given the user has launched the FlashGuard application
    And the user is logged in with valid credentials
    And the Dashboard is displayed

    When the user taps on the target element
    Then the expected tap result should be displayed

    When the user long-presses the list item for 1000 milliseconds
    Then the context menu should be displayed

    When the user dismisses the context menu
    And the user performs a short tap on the list item
    Then the context menu should not be displayed
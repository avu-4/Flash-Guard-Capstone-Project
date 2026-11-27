
Feature: Mobile application connectivity

  @mobile @smoke
  Scenario: Verify that FlashGuard launches successfully
    Given the FlashGuard mobile application is running
    Then the FlashGuard application package should be active

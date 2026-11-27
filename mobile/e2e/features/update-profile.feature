Feature: Update Profile

  As a registered FlashGuard user
  I want to update my personal profile details
  So that my account information remains accurate

  Scenario: TC-MOB-001 - Successfully update profile details

    Given the user has launched the FlashGuard application
    And the user is logged in with valid credentials
    And the Dashboard is displayed

    When the user navigates to the Account tab
    And the user opens the profile settings
    And the user updates their first name to "Updated"
    And the user updates their last name to "Tester"
    And the user updates their phone number to "0821234567"
    And the user clicks the Save Profile button

    Then a profile update success message should be displayed

    When the user logs out
    And the user logs in again with valid credentials
    And the user navigates to the Account tab
    And the user opens the profile settings

    Then the first name should be "Updated"
    And the last name should be "Tester"
    And the phone number should be "0821234567"
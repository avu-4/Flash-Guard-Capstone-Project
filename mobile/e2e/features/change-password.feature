Feature: Change Password

  As a registered FlashGuard user
  I want to change my password
  So that I can keep my account secure

  Scenario: TC-MOB-002 - Successfully change password

    Given the user has launched the FlashGuard application
    And the user is logged in with valid credentials
    And the Dashboard is displayed

    When the user navigates to the Account tab
    And the user opens Settings
    And the user selects Change Password
    And the user enters their current password
    And the user enters a valid new password
    And the user confirms the new password
    And the user clicks the Save Password button

    Then a password change success message should be displayed

    When the user logs out
    And the user logs in with the new password

    Then the user should be successfully authenticated
    And the Dashboard is displayed
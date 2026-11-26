@authentication @smoke
 
Feature: FlashGuard mobile authentication
 
  As a FlashGuard mobile user
  I want to access the login screen
  So that I can authenticate myself securely
 
  Scenario: TC-MOB-AUTH-001 - Verify the mobile login screen
 
    Then the welcome heading should be visible
    And the email field should be visible
    And the password field should be visible
    And the sign in button should be visible
    And the forgot password link should be visible
    And the create account link should be visible
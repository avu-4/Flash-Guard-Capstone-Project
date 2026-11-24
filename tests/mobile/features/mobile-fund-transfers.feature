
Feature: Mobile Fund Transfers
  As a FlashGuard user
  I want to transfer money using the mobile application
  So that I can send money to other beneficiaries securely

  @mobile @transfers @P0 @defect
  Scenario: Select a transfer recipient
    Given I am logged into the FlashGuard mobile application
    And I am on the Send Money screen
    When I search for a beneficiary
    And I select the matching beneficiary
    Then the selected beneficiary should be displayed as the transfer recipient

  @mobile @transfers @P0
  Scenario: Enter a valid transfer amount
    Given I am on the Send Money screen
    And I have selected a beneficiary
    When I enter a valid transfer amount
    Then the entered amount should be displayed correctly
    And the total amount should include the applicable transfer fee

  @mobile @transfers @P0
  Scenario: Authorize a pending transfer using an OTP
    Given I have submitted a transfer
    And the transfer appears as pending in History
    When I enter the correct OTP for the pending transfer
    Then the OTP should be accepted

  @mobile @transfers @P0
  Scenario: Confirm a transfer successfully
    Given I have entered the correct OTP for a pending transfer
    When I tap the Approve button
    Then the transfer should be marked as completed
    And a confirmation message should be displayed

  @mobile @transfers @P0 @defect
  Scenario: Cancel a transfer using the back button
    Given I am on the Send Money screen
    And I have entered transfer details
    When I press the back button
    Then a cancellation confirmation should be displayed
    And the transfer should not be submitted

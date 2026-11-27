Feature: Transfer Lifecycle Diagnostic

  @P0 @Integration @Diagnostic @TC-E2E-DIAG-001
  Scenario: Verify pending transfer across Web UI, API and Database

    Given the FlashGuard web application is available
    And the backend API is available
    And the database connection is available
    And the sender and recipient test accounts exist

    When the user logs in via the Web UI
    Then the Web Dashboard should be displayed
    And the authentication API request should succeed

    Given the sender opening balance is recorded
    And the recipient opening balance is recorded

    When the user selects the transfer option
    And the user enters a valid recipient
    And the user enters a transfer amount of "100.00"

    Then the transfer pre-validation API should succeed

    When the user confirms the transfer

    Then the transaction should be created successfully
    And the transaction ID should be recorded
    And the database transaction status should be "pending"
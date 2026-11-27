Feature: Complete Transfer Lifecycle

  As a registered FlashGuard user
  I want to transfer money successfully
  So that my transaction is consistent across
  the Web UI, API, Database and Mobile application

  @P0 @E2E @Integration @TC-E2E-001
  Scenario: TC-E2E-001 - Complete transfer lifecycle

    # Web UI and authentication

    Given the FlashGuard web application is available
    And the backend API is available
    And the database connection is available
    And the sender and recipient test accounts exist

    When the user logs in via the Web UI
    Then the Web Dashboard should be displayed
    And the authentication API request should succeed
    And a valid session should exist in the database

    # Record opening balances

    Given the sender opening balance is recorded
    And the recipient opening balance is recorded

    # Transfer initiation

    When the user selects the transfer option
    And the user enters a valid recipient
    And the user enters a transfer amount of "100.00"

    Then the transfer pre-validation API should succeed

    # Transfer confirmation

    When the user confirms the transfer
    And the user enters a valid OTP

    Then the transaction should be created successfully
    And the transaction ID should be recorded
    And the database transaction status should be "pending"

    # Notification validation

    Then the user should receive a transfer notification
    And the notification record should exist in the database
    And the notification should match the transaction ID

    # Mobile application validation

    When the user opens the FlashGuard mobile application
    And the user navigates to transaction history

    Then the transfer should be displayed in mobile history
    And the mobile transaction details should match the API
    And the mobile transaction details should match the database

    # Transfer completion and database integrity

    When the transfer reaches a successful terminal status

    Then the sender balance should be reduced correctly
    And the recipient balance should be increased correctly
    And the database integrity checks should pass
    And the mobile balance should match the API balance
    And the API balance should match the database balance 
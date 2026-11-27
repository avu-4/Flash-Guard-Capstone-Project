@P0 @Integration @Compliance @TC-E2E-DIAG-002
Feature: Failed Compliance Check Diagnostics

  Background:
    Given the FlashGuard web application is available
    And the backend API is available
    And the database connection is available
    When the user logs in via the Web UI
    Then the Web Dashboard should be displayed
    And the authentication API request should succeed
    Given a sanctioned test recipient exists
    And the compliance test opening balances are recorded
    And the transaction and ledger baselines are recorded
    And the compliance audit baseline is recorded
    When the user selects the transfer option
    And the user selects the sanctioned recipient
    And the user enters a transfer amount of "100.00"
    And the user attempts the sanctioned transfer

  @TC-E2E-DIAG-002A
  Scenario: Verify user-friendly compliance error
    Then the Web UI should display a user-friendly compliance error

  @TC-E2E-DIAG-002B
  Scenario: Verify database integrity after rejected transfer
    Then no transaction should be created in the database
    And no orphaned ledger entries should exist
    And the compliance test account balances should remain unchanged

  @TC-E2E-DIAG-002C
  Scenario: Verify failed transfer audit record
    Then the audit log should record the failed transfer attempt

  @TC-E2E-DIAG-002D
  Scenario: Verify compliance failure reason
    Then the audit log should contain the compliance failure reason
Feature: Failed Compliance Check

  As a FlashGuard user
  I want transfers to sanctioned recipients to be rejected
  So that compliance and database integrity are maintained

  @P0 @E2E @Integration @Compliance @TC-E2E-002
  Scenario: TC-E2E-002 - Failed compliance check

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

    Then the API compliance check should reject the transfer
    And the Web UI should display a user-friendly compliance error

    And no transaction should be created in the database
    And no orphaned ledger entries should exist
    And the compliance test account balances should remain unchanged

    And the audit log should record the failed transfer attempt
    And the audit log should contain the compliance failure reason
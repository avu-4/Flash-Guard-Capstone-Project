
@e2e @concurrent-transfers @FR-003
Feature: Concurrent transfers between Web and Mobile

  As a FlashGuard customer
  I want to initiate transfers using Web and Mobile
  So that the system processes transactions correctly across both platforms

  Background:
    Given I am logged in to FlashGuard on Web and Mobile

  @T-E2E-003 @P0 @defect
  Scenario: Prevent concurrent transfers from exceeding the available balance

    Given the sender account "Alice Ledger" has an available balance of "6830.00"

    When I prepare a transfer of "4000.00" from "Alice Ledger" to "Bob Wallet" on Web
    And I prepare a transfer of "4000.00" from "Alice Ledger" to "Bob Wallet" on Mobile

    When I submit both prepared transfers concurrently

    Then both transfers should appear as pending in Mobile Transaction History

    When I approve both pending transfers using their respective OTPs on Mobile

    Then the system should prevent the combined transfers from exceeding the available balance
    And the sender account balance should not be negative
    And the transaction records should reflect the correct transfer outcomes

@web @transfers @FR-003
Feature: Fund transfers (core transaction flow)
  As a FlashGuard customer
  I want to transfer money to another account
  So that the funds move securely, with validation, OTP authorization and clear error handling

  Background:
    Given I am logged in as "alice@flashguard.local" with password "offline-demo"



  @T-UI-TR-001 @P0 @positive @smoke
  Scenario: Initiate a transfer to a valid recipient
    Given I open the Transfers page
    When I submit a transfer with the following details:
      | sender       | recipient  | amount | reference            |
      | Alice Ledger | Bob Wallet | 250.00 | Invoice INV-2026-001 |
    Then a success notification is displayed confirming the transfer was created
    And the transfer form is cleared
    And the transfer "250.00" from "Alice Ledger" to "Bob Wallet" appears in my transaction history with status "Pending"
    And the available balance of "Alice Ledger" is still "10000.00"

  @T-UI-TR-002 @P0 @positive
  Scenario Outline: Transfer summary reflects the selected details before confirmation
    Given I open the Transfers page
    When I select "<sender>" as the sender account
    And I select "<recipient>" as the recipient
    And I enter the amount "<amount>"
    Then the transfer summary shows the sender "<sender>"
    And the transfer summary shows the recipient "<recipient>"
    And the transfer summary shows the total amount "<amount>" in ZAR
    And the transfer summary shows an estimated fee of "ZAR 0.00"
    And the "Confirm & Transfer" button is enabled

    Examples:
      | sender       | recipient    | amount   |
      | Alice Ledger | Bob Wallet   | 100.00   |
      | Bob Wallet   | Alice Ledger | 2500.00  |
      | Alice Ledger | Bob Wallet   | 0.01     |

  

  @T-UI-TR-003 @P0 @boundary
  Scenario Outline: Amount is validated against the minimum and maximum limits
    Given the balance of "<sender>" is set to "60000.00"
    And I open the Transfers page
    When I submit a transfer with the following details:
      | sender   | recipient  | amount   | reference |
      | <sender> | Bob Wallet | <amount> |           |
    Then the transfer is <outcome>

       @minimum
    Examples: Minimum boundary (min 0.01)
      | sender       | amount | outcome                                                    |
      | Alice Ledger | -0.01  | blocked by the amount field validation                     |
      | Alice Ledger | 0.00   | rejected with the error "Invalid transfer payload"         |
      | Alice Ledger | 0.01   | accepted and created with status "Pending"                 |
      | Alice Ledger | 0.02   | accepted and created with status "Pending"                 |
    @maximum @defect
    Examples: Maximum boundary (limit 50000.00, as per BRD FR-003)
      | sender       | amount   | outcome                                                          |
      | Alice Ledger | 49999.99 | accepted and created with status "Pending"                       |
      | Alice Ledger | 50000.00 | accepted and created with status "Pending"                       |
      | Alice Ledger | 50000.01 | rejected with an error stating the transfer limit was exceeded   |

  @T-UI-TR-004 @P0 @boundary
  Scenario Outline: Amount decimal places and currency are validated
    Given I open the Transfers page
    When I select "Alice Ledger" as the sender account
    And I select "Bob Wallet" as the recipient
    And I enter the amount "<entered>"
    Then the amount field is prefixed with the currency "ZAR"
    And the transfer summary displays the total amount in ZAR format
    When I attempt to confirm the transfer
    Then the transfer is <outcome>

    Examples: Valid decimal precision
      | entered | outcome                                    |
      | 100     | accepted as "100.00" with status "Pending" |
      | 100.5   | accepted as "100.50" with status "Pending" |
      | 100.55  | accepted as "100.55" with status "Pending" |

    @defect
    Examples: More than 2 decimal places (BRD: must be rejected, not silently rounded)
      | entered | outcome                                                 |
      | 100.555 | rejected with an error about decimal places             |
      | 100.999 | rejected with an error about decimal places             |

    Examples: Non-numeric input
      | entered | outcome                                                 |
      | abc     | prevented because the amount field stays empty          |



    @T-UI-TR-005 @P0 @negative @transfers
  Scenario Outline: Transfers to blocked or unknown recipients are rejected
    Given <recipient_setup>
    And I open the Transfers page
    When I select "Alice Ledger" as the sender account
    And I identify the recipient as "<recipient>"
    And I enter the amount "100.00"
    And I confirm the transfer
    Then an error notification is displayed with the message "<message>"
    And no transfer is created
    And the available balance of "Alice Ledger" is still "10000.00"

    Examples: Inactive, blocked and unknown accounts
      | recipient_setup                                           | recipient      | message                              |
      | the recipient account is inactive                         | Charlie Frozen | Sender/recipient not valid           |
      | the recipient "Bob Wallet" has blacklist status "blocked" | Bob Wallet     | Recipient is blocked                 |
      @T-UI-TR-006 @P0 @negative @defect
  Scenario: A user cannot transfer money to their own account
    Given I open the Transfers page
    When I select "Alice Ledger" as the sender account
    Then "Alice Ledger" is not listed as an available recipient
    When I select "Bob Wallet" as the recipient
    And I change the sender account to "Bob Wallet"
    And I enter the amount "100.00"
    And I confirm the transfer
    Then no transfer is created
 

    @T-UI-TR-007 @P0 @functional @otp
  Scenario Outline: Confirm a transfer by entering the one-time PIN
    Given I open the Transfers page
    When I submit a transfer with the following details:
      | sender       | recipient  | amount | reference |
      | Alice Ledger | Bob Wallet | 500.00 | OTP test  |
    And I open the pending approval for "500.00" in the mobile app
    And I enter the OTP "<otp>" in the mobile app
    And I approve the transfer in the mobile app
    Then <result>

    Examples: Valid OTP
      | otp                        | result                                                  |
      | the code shown on the card | the transfer is completed and the balances are updated  |

    Examples: Invalid OTP
      | otp    | result                                                           |
      | 000000 | the transfer remains "pending" and the balances are unchanged    |
      | 12345  | the transfer remains "pending" and the balances are unchanged    |


  @T-UI-TR-008 @P1 @error-path
  Scenario Outline: Failed transfers show a clear error and leave the account unchanged
    Given the transfer service <condition>
    And I open the Transfers page
    When I submit a transfer with the following details:
      | sender       | recipient  | amount   | reference     |
      | Alice Ledger | Bob Wallet | <amount> | Failure check |
    Then an error notification is displayed with <message>
    And the "Confirm & Transfer" button is enabled again
    And the entered transfer details are still shown on the form
    And no transfer is created
    And the available balance of "Alice Ledger" is still "10000.00"

       Examples: Rejection and failures with a response
      | condition                          | amount   | message                                                |
      | is available                       | 10000.01 | the text "Insufficient funds"                          |
      | responds with a 500 server error   | 100.00   | a user-friendly message and no technical stack trace   |
      | is unreachable                     | 100.00   | the text "Network error - unable to connect to server" |

    @defect
    Examples: No response (BRD: timeout handling)
      | condition                              | amount | message                                       |
      | does not respond within 30 seconds     | 100.00 | a message that the request timed out          |
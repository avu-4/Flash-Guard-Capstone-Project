USE FlashGuard;
GO


/*Test 4: Check for negative balances*/


SELECT id, email, balance
FROM dbo.accounts
WHERE balance < 0;

/*Expected: 0 rows.*/

/*Test 5: Check Alice's available balance*/
SELECT
    id,
    full_name,
    balance
FROM dbo.accounts
WHERE id = 1;

/*Expected: R10,000.*/

/*Test 6: Check ledger entries*/
SELECT
    t.id AS transaction_id,
    t.status,
    t.amount AS transaction_amount,
    l.account_id,
    l.entry_type,
    l.amount AS ledger_amount
FROM dbo.transactions t
INNER JOIN dbo.ledger_entries l
    ON t.id = l.transaction_id
WHERE t.id = 1;

/*Expected: Two ledger entries:
- Alice: debit R250.
- Bob: credit R250*/


/*Test 7: Check for dirty reads
Use two SSMS query windows.*/
/*Window 1:*/
BEGIN TRANSACTION;

UPDATE dbo.accounts
SET balance = balance - 1000
WHERE id = 1;

-- Leave transaction open.
/*Window 2:*/
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;

SELECT balance
FROM dbo.accounts
WHERE id = 1;

/*Expected : Window 2 waits until Window 1 commits or rolls back. It must not read the uncommited balance.
/*Return to Window 1:*/
ROLLBACK TRANSACTION;


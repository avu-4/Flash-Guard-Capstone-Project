/* ============================================================================
   TRANSACTION DATA INTEGRITY 4 of 5 (
   Verify the recipient account is credited (two-sided entry)
 
   Every completed transfer needs a debit on the SENDER and a credit on the
   RECIPIENT, each for the full transaction amount.
 
   RESULT:  0 rows = PASS     any rows = FAIL (one row per offending transaction)
   ============================================================================ */
USE FlashGuard;
 
SELECT  t.id AS transaction_id,
        t.sender_account_id,
        t.recipient_account_id,
        t.amount
FROM    dbo.transactions t
WHERE   t.status = 'completed'
  AND   t.transaction_type = 'transfer'
  AND (
        NOT EXISTS (SELECT 1
                    FROM   dbo.ledger_entries l
                    WHERE  l.transaction_id = t.id
                      AND  l.entry_type     = 'debit'
                      AND  l.account_id     = t.sender_account_id
                      AND  l.amount         = t.amount)
     OR NOT EXISTS (SELECT 1
                    FROM   dbo.ledger_entries l
                    WHERE  l.transaction_id = t.id
                      AND  l.entry_type     = 'credit'
                      AND  l.account_id     = t.recipient_account_id
                      AND  l.amount         = t.amount)
      );



   ---------------------------------------------------------------------------- */
 
/* ============================================================================
   TRANSACTION DATA INTEGRITY 1 of 5 
   Verify transaction.amount matches the ledger debit and credit
 
   Double-entry rule: for every completed transaction, the total debited and the
   total credited must each equal the transaction amount.
 
 
   RESULT:  0 rows = PASS     any rows = FAIL (one row per offending transaction)
   ============================================================================ */
USE FlashGuard;
 
SELECT  t.id                                                                  AS transaction_id,
        t.amount                                                              AS transaction_amount,
        ISNULL(SUM(CASE WHEN l.entry_type = 'debit'  THEN l.amount END), 0)   AS total_debit,
        ISNULL(SUM(CASE WHEN l.entry_type = 'credit' THEN l.amount END), 0)   AS total_credit
FROM    dbo.transactions t
LEFT JOIN dbo.ledger_entries l ON l.transaction_id = t.id
WHERE   t.status = 'completed'
GROUP BY t.id, t.amount
HAVING  ISNULL(SUM(CASE WHEN l.entry_type = 'debit'  THEN l.amount END), 0) <> t.amount
     OR ISNULL(SUM(CASE WHEN l.entry_type = 'credit' THEN l.amount END), 0) <> t.amount;
 
 

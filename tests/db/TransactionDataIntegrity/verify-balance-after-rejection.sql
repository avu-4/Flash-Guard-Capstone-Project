/* ============================================================================
   TRANSACTION DATA INTEGRITY 5 of 5 (P0)
   Verify failed transactions don't affect balances
 
   Two parts:
     5a  A failed transaction must have NO ledger entries (nothing was posted).
         RESULT: 0 rows = PASS     any rows = FAIL
     5b  Balance snapshot. Run it BEFORE and AFTER the failed transfer (for
         example the insufficient-funds row of the TR-008 scenario) and compare.
         RESULT: the two outputs must be identical.
   ============================================================================ */
USE FlashGuard;
 
/* ---- 5a: failed transactions must not have posted anything ---- */
SELECT  t.id AS transaction_id,
        t.status,
        COUNT(l.id) AS ledger_rows
FROM    dbo.transactions t
LEFT JOIN dbo.ledger_entries l ON l.transaction_id = t.id
WHERE   t.status IN ('rejected', 'failed', 'cancelled')
GROUP BY t.id, t.status
HAVING  COUNT(l.id) > 0;
 
/* ---- 5b: balance snapshot (run before and after, then compare) ---- */
SELECT  id, full_name, balance
FROM    dbo.accounts
ORDER BY id;
 
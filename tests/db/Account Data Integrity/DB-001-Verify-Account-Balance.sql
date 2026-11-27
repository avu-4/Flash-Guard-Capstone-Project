USE FlashGuard_Test;
SELECT
    a.id AS AccountID,
    a.email,
    a.balance AS ActualBalance,
 
    COALESCE(SUM(
        CASE
            WHEN LOWER(l.entry_type) = 'credit'
            THEN l.amount
            WHEN LOWER(l.entry_type) = 'debit'
            THEN -l.amount
            ELSE 0
        END
    ), 0) AS ExpectedBalance,
 
    CASE
        WHEN a.balance = COALESCE(SUM(
            CASE
                WHEN LOWER(l.entry_type) = 'credit'
                THEN l.amount
                WHEN LOWER(l.entry_type) = 'debit'
                THEN -l.amount
                ELSE 0
            END
        ), 0)
        THEN 'PASS'
        ELSE 'FAIL'
    END AS TestResult
 
FROM dbo.accounts a
 
LEFT JOIN dbo.ledger_entries l
    ON a.id = l.account_id
 
GROUP BY
    a.id,
    a.email,
    a.balance
 
ORDER BY a.id;
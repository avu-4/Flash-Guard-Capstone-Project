USE FlashGuard_Test

SELECT
    id,
    email,
    is_active,
    COUNT(*) OVER() AS MatchingRecords,
    CASE
        WHEN is_active = 0 THEN 'PASS'
        ELSE 'FAIL'
    END AS TestResult
FROM dbo.accounts
WHERE id = 3;
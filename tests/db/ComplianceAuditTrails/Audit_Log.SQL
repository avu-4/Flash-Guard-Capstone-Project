SELECT 
    t.id AS transaction_id, 
    t.sender_account_id, 
    t.amount, 
    t.created_at AS transaction_time
FROM dbo.transactions t
LEFT JOIN dbo.audit_log a 
  ON a.account_id = t.sender_account_id 
  AND a.created_at >= t.created_at
  AND (a.metadata LIKE '%' + CAST(t.id AS VARCHAR(50)) + '%' OR a.action LIKE '%TRANSACTION%')
WHERE a.id IS NULL
ORDER BY t.created_at DESC;
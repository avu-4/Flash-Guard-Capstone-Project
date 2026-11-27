SELECT 
id AS transaction_id,
sender_account_id,
recipient_account_id,
amount,
status,
compliance_flag,
created_at
FROM dbo.transactions
WHERE compliance_flag IS NOT NULL 
  AND status <> 'rejected'
ORDER BY created_at DESC;
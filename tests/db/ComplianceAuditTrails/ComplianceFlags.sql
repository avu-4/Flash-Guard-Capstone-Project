SELECT t.id AS transaction_id, t.status, t.compliance_flag, COUNT(l.id) AS ledger_rows
FROM dbo.transactions t
JOIN dbo.ledger_entries l ON l.transaction_id = t.id
WHERE t.compliance_flag IS NOT NULL OR t.status = 'rejected'
GROUP BY t.id, t.status, t.compliance_flag
ORDER BY t.id;

SELECT id AS transaction_id, status, compliance_flag, authorized_at, settled_at
FROM dbo.transactions
WHERE compliance_flag IS NOT NULL
  AND (status <> 'rejected' OR authorized_at IS NOT NULL OR settled_at IS NOT NULL)
ORDER BY id;

SELECT t.id AS transaction_id, t.status, r.blacklist_status
FROM dbo.transactions t
JOIN dbo.recipients r
  ON r.sender_account_id = t.sender_account_id
 AND r.recipient_account_id = t.recipient_account_id
WHERE r.blacklist_status = 'blocked'
  AND t.status <> 'rejected'
ORDER BY t.id;

SELECT t.id, t.status, t.compliance_flag, t.authorized_at, t.settled_at,
       COUNT(l.id) AS ledger_rows
FROM dbo.transactions t
LEFT JOIN dbo.ledger_entries l ON l.transaction_id = t.id
WHERE t.compliance_flag IS NOT NULL
GROUP BY t.id, t.status, t.compliance_flag, t.authorized_at, t.settled_at;
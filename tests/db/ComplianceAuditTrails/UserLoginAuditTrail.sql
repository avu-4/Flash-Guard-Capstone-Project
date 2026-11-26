SELECT 
    id AS audit_id,
    account_id,
    action,
    metadata,
    created_at AS event_time
FROM dbo.audit_log
WHERE action LIKE '%LOGIN%' 
   OR action LIKE '%LOGOUT%'
ORDER BY created_at DESC;
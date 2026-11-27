USE FlashGuard;
GO

DELETE FROM dbo.ledger_entries;
DELETE FROM dbo.transactions;
DELETE FROM dbo.recipients;
DELETE FROM dbo.audit_log;
DELETE FROM dbo.accounts;
GO

SET IDENTITY_INSERT dbo.accounts ON;
INSERT INTO dbo.accounts (id, email, full_name, password_hash, balance, is_active)
VALUES
  (1, 'alice@flashguard.local', 'Alice Ledger', 'offline-demo', 10000.00, 1),
  (2, 'bob@flashguard.local', 'Bob Wallet', 'offline-demo', 2500.00, 1),
  (3, 'charlie@flashguard.local', 'Charlie Frozen', 'offline-demo', 450.00, 0),
  (4, 'services@flashguard.local', 'FlashGuard Mobile Services', 'offline-demo', 0.00, 1);
SET IDENTITY_INSERT dbo.accounts OFF;
GO

SET IDENTITY_INSERT dbo.recipients ON;
INSERT INTO dbo.recipients (id, sender_account_id, recipient_account_id, blacklist_status)
VALUES
  (1, 1, 2, 'clear'),
  (2, 1, 3, 'blocked');
SET IDENTITY_INSERT dbo.recipients OFF;
GO

SET IDENTITY_INSERT dbo.transactions ON;
INSERT INTO dbo.transactions (
  id, sender_account_id, recipient_account_id, amount, status, created_at, authorized_at, settled_at, compliance_flag
)
VALUES
  (1, 1, 2, 250.00, 'completed', DATEADD(MINUTE, -30, SYSUTCDATETIME()), DATEADD(MINUTE, -29, SYSUTCDATETIME()), DATEADD(MINUTE, -28, SYSUTCDATETIME()), NULL),
  (2, 1, 2, 100.00, 'pending', DATEADD(MINUTE, -10, SYSUTCDATETIME()), NULL, NULL, NULL),
  (3, 1, 3, 15000.00, 'rejected', DATEADD(MINUTE, -5, SYSUTCDATETIME()), NULL, NULL, 'aml');
SET IDENTITY_INSERT dbo.transactions OFF;
GO

SET IDENTITY_INSERT dbo.ledger_entries ON;
INSERT INTO dbo.ledger_entries (id, transaction_id, account_id, entry_type, amount)
VALUES
  (1, 1, 1, 'debit', 250.00),
  (2, 1, 2, 'credit', 250.00);
SET IDENTITY_INSERT dbo.ledger_entries OFF;
GO

INSERT INTO dbo.audit_log (account_id, action, metadata)
VALUES
  (1, 'login', '{"channel":"web"}'),
  (1, 'transfer_initiated', '{"transaction_id":2,"channel":"mobile"}'),
  (1, 'compliance_blocked', '{"transaction_id":3,"rule":"aml"}');
GO

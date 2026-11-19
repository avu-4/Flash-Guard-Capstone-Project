IF DB_ID('FlashGuard') IS NULL
BEGIN
  CREATE DATABASE FlashGuard;
END
GO

USE FlashGuard;
GO

IF OBJECT_ID('dbo.audit_log', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.audit_log (
    id INT IDENTITY(1,1) PRIMARY KEY,
    account_id INT NULL,
    action NVARCHAR(100) NOT NULL,
    metadata NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('dbo.accounts', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.accounts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    full_name NVARCHAR(255) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL DEFAULT 'offline-demo',
    balance DECIMAL(18,2) NOT NULL DEFAULT 0,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('dbo.recipients', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.recipients (
    id INT IDENTITY(1,1) PRIMARY KEY,
    sender_account_id INT NOT NULL,
    recipient_account_id INT NOT NULL,
    blacklist_status NVARCHAR(20) NOT NULL DEFAULT 'clear',
    CONSTRAINT FK_recipients_sender FOREIGN KEY (sender_account_id) REFERENCES dbo.accounts(id),
    CONSTRAINT FK_recipients_recipient FOREIGN KEY (recipient_account_id) REFERENCES dbo.accounts(id)
  );
END
GO

IF OBJECT_ID('dbo.transactions', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.transactions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    sender_account_id INT NOT NULL,
    recipient_account_id INT NOT NULL,
    transaction_type NVARCHAR(20) NOT NULL DEFAULT 'transfer',
    service_type NVARCHAR(20) NULL,
    service_network NVARCHAR(50) NULL,
    service_phone_number NVARCHAR(20) NULL,
    amount DECIMAL(18,2) NOT NULL,
    status NVARCHAR(20) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    authorized_at DATETIME2 NULL,
    settled_at DATETIME2 NULL,
    compliance_flag NVARCHAR(20) NULL,
    CONSTRAINT FK_transactions_sender FOREIGN KEY (sender_account_id) REFERENCES dbo.accounts(id),
    CONSTRAINT FK_transactions_recipient FOREIGN KEY (recipient_account_id) REFERENCES dbo.accounts(id)
  );
END
GO

IF COL_LENGTH('dbo.transactions', 'transaction_type') IS NULL
BEGIN
  ALTER TABLE dbo.transactions
  ADD transaction_type NVARCHAR(20) NOT NULL CONSTRAINT DF_transactions_transaction_type DEFAULT 'transfer';
END
GO

IF COL_LENGTH('dbo.transactions', 'service_type') IS NULL
BEGIN
  ALTER TABLE dbo.transactions
  ADD service_type NVARCHAR(20) NULL;
END
GO

IF COL_LENGTH('dbo.transactions', 'service_network') IS NULL
BEGIN
  ALTER TABLE dbo.transactions
  ADD service_network NVARCHAR(50) NULL;
END
GO

IF COL_LENGTH('dbo.transactions', 'service_phone_number') IS NULL
BEGIN
  ALTER TABLE dbo.transactions
  ADD service_phone_number NVARCHAR(20) NULL;
END
GO

IF OBJECT_ID('dbo.ledger_entries', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ledger_entries (
    id INT IDENTITY(1,1) PRIMARY KEY,
    transaction_id INT NOT NULL,
    account_id INT NOT NULL,
    entry_type NVARCHAR(10) NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ledger_transaction FOREIGN KEY (transaction_id) REFERENCES dbo.transactions(id),
    CONSTRAINT FK_ledger_account FOREIGN KEY (account_id) REFERENCES dbo.accounts(id)
  );
END
GO

IF OBJECT_ID('dbo.payment_methods', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.payment_methods (
    id INT IDENTITY(1,1) PRIMARY KEY,
    account_id INT NOT NULL,
    card_number_last_four NVARCHAR(4) NOT NULL,
    card_number_encrypted NVARCHAR(255) NOT NULL,
    nickname NVARCHAR(100) NOT NULL,
    expiry_date NVARCHAR(5) NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_payment_methods_account FOREIGN KEY (account_id) REFERENCES dbo.accounts(id)
  );
END
GO

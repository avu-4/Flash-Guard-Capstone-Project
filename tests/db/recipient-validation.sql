

USE FlashGuard;
GO



-- TEST 1: Identify blocked recipients
SELECT *
FROM dbo.recipients
WHERE blacklist_status = 'blocked';

-- EXPECTED: 1 row (recipient Charlie, ID 3)


-- TEST 2: Check whether blocked recipients
-- have completed transactions
SELECT
    r.id AS recipient_record_id,
    r.recipient_account_id,
    r.blacklist_status,
    t.id AS transaction_id,
    t.status
FROM dbo.recipients r
INNER JOIN dbo.transactions t
    ON r.sender_account_id = t.sender_account_id
    AND r.recipient_account_id = t.recipient_account_id
WHERE r.blacklist_status = 'blocked'
AND t.status = 'completed';

-- EXPECTED: 0 rows


-- TEST 3: Verify sender cannot be recipient
SELECT *
FROM dbo.transactions
WHERE sender_account_id = recipient_account_id;

-- EXPECTED: 0 rows


-- TEST 8: Find inactive accounts

SELECT *
FROM dbo.accounts
WHERE is_active = 0;

-- EXPECTED: Charlie Frozen (ID 3)


-- TEST 9: Confirm inactive account still exists

SELECT
    id,
    email,
    full_name,
    balance,
    is_active
FROM dbo.accounts
WHERE id = 3;

-- EXPECTED: Charlie's record still exists
-- is_active = 0
/*Retrieve all registered email addresses*/

USE FlashGuard_Test;
 
SELECT
    id,
    email,
    full_name
FROM dbo.accounts
ORDER BY email;


/*Identify duplicate email addresses*/

SELECT

    email,

    COUNT(*) AS DuplicateCount

FROM dbo.accounts

GROUP BY email

HAVING COUNT(*) > 1;
 


/*Verify the unique constrraint on the email column*/

SELECT
    i.name AS IndexName,
    i.is_unique AS IsUnique,
    c.name AS ColumnName
FROM sys.indexes i
INNER JOIN sys.index_columns ic
    ON i.object_id = ic.object_id
    AND i.index_id = ic.index_id
INNER JOIN sys.columns c
    ON ic.object_id = c.object_id
    AND ic.column_id = c.column_id
WHERE i.object_id = OBJECT_ID('dbo.accounts')
AND c.name = 'email';



/*Attempt to insert a duplicate email address*/

BEGIN TRANSACTION;
 
BEGIN TRY
 
    INSERT INTO dbo.accounts
    (
        email,
        full_name,
        balance,
        is_active
    )
    VALUES
    (
        'alice@flashguard.local',
        'Duplicate Alice',
        0,
        1
    );
 
    SELECT
        'FAIL - Duplicate email was accepted'
        AS TestResult;
 
END TRY
 
BEGIN CATCH
 
    IF ERROR_NUMBER() IN (2601, 2627)
    BEGIN
        SELECT
            'PASS - Duplicate email was rejected'
            AS TestResult,
            ERROR_MESSAGE() AS ErrorMessage;
    END
    ELSE
    BEGIN
        SELECT
            'INCONCLUSIVE - Different database error'
            AS TestResult,
            ERROR_MESSAGE() AS ErrorMessage;
    END
 
END CATCH;
 
IF @@TRANCOUNT > 0
    ROLLBACK TRANSACTION;
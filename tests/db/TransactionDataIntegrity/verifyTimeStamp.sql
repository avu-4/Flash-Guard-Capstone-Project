/* ============================================================================
   TRANSACTION DATA INTEGRITY 3 of 5 (P0)
   Verify transaction timestamps (created_at, authorized_at, settled_at) are
   chronological
 
   created_at <= authorized_at <= settled_at, and a settled transaction must
   also have been authorized.
 
   RESULT:  0 rows = PASS     any rows = FAIL
   ============================================================================ */
USE FlashGuard;
 
SELECT  id, status, created_at, authorized_at, settled_at
FROM    dbo.transactions
WHERE   (authorized_at IS NOT NULL AND authorized_at < created_at)
     OR (settled_at    IS NOT NULL AND settled_at < ISNULL(authorized_at, created_at))
     OR (settled_at    IS NOT NULL AND authorized_at IS NULL);
 
 

 
/* ============================================================================
   TRANSACTION DATA INTEGRITY 2 of 5 
   Verify transaction status progression (pending -> completed -> settled)
 
   
  
 
   RESULT:  0 rows = PASS     any rows = FAIL
   ============================================================================ */
USE FlashGuard;
 
SELECT  id, status, created_at, authorized_at, settled_at
FROM    dbo.transactions
WHERE   (status = 'pending'   AND (authorized_at IS NOT NULL OR settled_at IS NOT NULL))
     OR (status = 'completed' AND  authorized_at IS NULL)
     OR (status = 'settled'   AND (authorized_at IS NULL OR settled_at IS NULL))
     OR (status = 'rejected'  AND (authorized_at IS NOT NULL OR settled_at IS NOT NULL))
     OR  status NOT IN ('pending', 'completed', 'settled', 'rejected');
 
-- SQL script to check database schema and identify issues
-- Run this on your server to diagnose schema problems

-- 1. Check if tables exist
SHOW TABLES;

-- 2. Check Client table structure
DESCRIBE Client;
SHOW CREATE TABLE Client;

-- 3. Check PurchaseOffer table structure
DESCRIBE PurchaseOffer;
SHOW CREATE TABLE PurchaseOffer;

-- 4. Check LineItem table structure
DESCRIBE LineItem;
SHOW CREATE TABLE LineItem;

-- 5. Check POView table structure
DESCRIBE POView;
SHOW CREATE TABLE POView;

-- 6. Check foreign key constraints
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'laapak_po'
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, CONSTRAINT_NAME;

-- 7. Check for any missing indexes
SHOW INDEX FROM Client;
SHOW INDEX FROM PurchaseOffer;
SHOW INDEX FROM LineItem;
SHOW INDEX FROM POView;

-- 8. Check current data counts
SELECT 'Client' as table_name, COUNT(*) as count FROM Client
UNION ALL
SELECT 'PurchaseOffer', COUNT(*) FROM PurchaseOffer
UNION ALL
SELECT 'LineItem', COUNT(*) FROM LineItem
UNION ALL
SELECT 'POView', COUNT(*) FROM POView;


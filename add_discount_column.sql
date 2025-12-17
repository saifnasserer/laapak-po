-- Add discount column to PurchaseOffer table
-- Run this on your server: mysql -u root -p0000 laapak_po < add_discount_column.sql

ALTER TABLE PurchaseOffer 
ADD COLUMN discount FLOAT DEFAULT 0 NOT NULL 
AFTER taxRate;


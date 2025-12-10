# Quick Fix Guide - Database Insert Issues

## Problem
New clients and Purchase Offers (POs) are not being saved to the database.

## Root Cause
The database schema is likely out of sync with the Prisma schema. The Prisma schema has been updated with proper foreign key constraints and cascade deletes, but the actual MySQL database hasn't been updated yet.

## Quick Fix (Run on Server)

### Option 1: Automated Script (Recommended)
```bash
cd "/path/to/Laapak PO"
./fix-database-on-server.sh
```

### Option 2: Manual Steps
```bash
cd "/path/to/Laapak PO"

# 1. Set environment variable
export DATABASE_URL="mysql://root:0000@localhost:3306/laapak_po"

# 2. Generate Prisma Client
npx prisma generate

# 3. Sync database schema
npx prisma db push --accept-data-loss
```

## What This Does

1. **Updates Foreign Key Constraints**: Ensures all relationships are properly defined
2. **Adds Cascade Deletes**: When a PurchaseOffer is deleted, related LineItems and POViews are automatically deleted
3. **Syncs Schema**: Makes sure the database structure matches the Prisma schema exactly
4. **Fixes Missing Constraints**: Adds any missing indexes, unique constraints, or foreign keys

## Verification

After running the fix, test by:
1. Creating a new client
2. Creating a new Purchase Offer for that client
3. Checking the database to confirm records were saved

## Common Issues After Fix

### Issue: "Table already exists"
- **Solution**: The `--accept-data-loss` flag should handle this, but if it persists, you may need to manually drop and recreate tables (BACKUP FIRST!)

### Issue: "Foreign key constraint fails"
- **Solution**: Make sure all existing data has valid foreign key references before syncing

### Issue: "Connection refused"
- **Solution**: Verify DATABASE_URL is correct and MySQL is running

## Need More Help?

Run the diagnostic SQL script on your server:
```bash
mysql -u root -p0000 laapak_po < check-database-schema.sql > schema-report.txt
cat schema-report.txt
```

This will show you the exact structure of your database tables and help identify any remaining issues.


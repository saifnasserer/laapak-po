# Database Schema Diagnosis

## Potential Issues Preventing Inserts

### 1. **Schema Mismatch (Most Likely)**
The Prisma schema has been updated with cascade deletes, but the actual database might not have these constraints yet. This can cause:
- Foreign key constraint violations
- Insert failures
- Data integrity issues

### 2. **Missing Foreign Key Constraints**
If the database was created manually or with an older schema, it might be missing:
- Foreign key from `PurchaseOffer.clientId` → `Client.id`
- Foreign key from `LineItem.poId` → `PurchaseOffer.id`
- Foreign key from `POView.poId` → `PurchaseOffer.id`

### 3. **Missing Indexes**
The `publicId` field in `PurchaseOffer` should have a UNIQUE index. If missing, inserts might fail.

### 4. **Data Type Mismatches**
- UUID strings vs auto-increment integers
- Boolean defaults not set
- DateTime defaults not set

## Solution Steps

### Step 1: Run Diagnostic SQL
On your server, run the diagnostic SQL script:
```bash
mysql -u root -p0000 laapak_po < check-database-schema.sql > schema-report.txt
```

### Step 2: Sync Prisma Schema with Database
On your server, run:
```bash
cd "/path/to/Laapak PO"
export DATABASE_URL="mysql://root:0000@localhost:3306/laapak_po"
npx prisma generate
npx prisma db push --accept-data-loss
```

### Step 3: Verify Schema
After syncing, verify the schema matches:
```bash
npx prisma db pull --print
```

### Step 4: Test Inserts
Try creating a client and purchase offer to verify everything works.

## Common Error Patterns

### Error: "Foreign key constraint fails"
- **Cause**: Database schema doesn't match Prisma schema
- **Fix**: Run `prisma db push`

### Error: "Duplicate entry for key 'publicId'"
- **Cause**: publicId uniqueness constraint working correctly
- **Fix**: Generate a new unique publicId

### Error: "Column 'X' cannot be null"
- **Cause**: Missing default values in database
- **Fix**: Sync schema with `prisma db push`

### Error: "Table doesn't exist"
- **Cause**: Tables not created
- **Fix**: Run `prisma db push` or `prisma migrate deploy`

## Schema Verification Checklist

- [ ] All 4 tables exist: Client, PurchaseOffer, LineItem, POView
- [ ] Foreign keys are properly defined
- [ ] Cascade deletes are configured
- [ ] Unique constraint on PurchaseOffer.publicId
- [ ] Default values are set for required fields
- [ ] Indexes are created for foreign keys


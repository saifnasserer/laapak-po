# Fix: Items Not Showing & No Logs Appearing

## Problems Identified

1. **Errors only logged in development mode** - Production errors are silent
2. **Prisma Client might not be regenerated** after schema fix
3. **Application might not be restarted** after changes

## Fixes Applied

### 1. Improved Error Logging
- ✅ Updated `src/app/page.tsx` - Always logs errors (not just in dev)
- ✅ Updated `src/lib/prisma.ts` - Added Prisma logging
- ✅ Updated `src/app/api/clients/route.ts` - Always logs full error details

### 2. Commands to Run on Server

```bash
# 1. Regenerate Prisma Client (IMPORTANT!)
cd "/path/to/Laapak PO"
export DATABASE_URL="mysql://root:0000@localhost:3306/laapak_po"
npx prisma generate

# 2. Verify Prisma Client is working
npx prisma db pull --print | head -20

# 3. Restart the application (CRITICAL!)
pm2 restart laapak-po
# OR if not using PM2:
# Kill the process and restart: npm run start:prod

# 4. Check logs
pm2 logs laapak-po --lines 50
# OR if not using PM2, check your terminal output
```

## Why Items Aren't Showing

Possible causes:
1. **Prisma Client not regenerated** - After schema changes, you MUST run `npx prisma generate`
2. **Application not restarted** - Next.js caches the Prisma Client
3. **Database connection issue** - Check if DATABASE_URL is correct
4. **Silent errors** - Now fixed with improved logging

## Debugging Steps

### Step 1: Check if Prisma Client is working
```bash
npx prisma studio
# This will open a browser interface to view your database
# If it works, Prisma Client is fine
```

### Step 2: Test database connection
```bash
mysql -u root -p0000 laapak_po -e "SELECT COUNT(*) as client_count FROM Client;"
mysql -u root -p0000 laapak_po -e "SELECT COUNT(*) as po_count FROM PurchaseOffer;"
```

### Step 3: Check application logs
```bash
# If using PM2:
pm2 logs laapak-po --lines 100

# Look for:
# - Database connection errors
# - Prisma errors
# - Any error messages
```

### Step 4: Test API directly
```bash
# Test creating a client via API
curl -X POST http://localhost:3002/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Client"}'

# Check the response and logs
```

## Expected Behavior After Fix

1. ✅ All errors are logged (check PM2 logs or terminal)
2. ✅ Database queries work properly
3. ✅ Items appear in the UI
4. ✅ Actions are logged in console/logs

## If Still Not Working

1. **Check PM2 logs**: `pm2 logs laapak-po --lines 200`
2. **Verify DATABASE_URL**: `echo $DATABASE_URL` or check `.env` file
3. **Test Prisma directly**: `npx prisma studio`
4. **Check database**: Verify data exists with `mysql` commands
5. **Restart everything**: 
   ```bash
   pm2 stop laapak-po
   pm2 start laapak-po
   # OR
   pm2 restart laapak-po
   ```

## Key Takeaway

**After ANY schema changes, you MUST:**
1. Run `npx prisma generate`
2. Restart the application
3. Check logs for errors


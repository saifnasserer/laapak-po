# Debug: Only 2 Clients Showing Instead of 9

## Problem
- Database has 9 clients
- Application only shows 2 clients (Al Attal and Tourism)
- No logs appearing

## Possible Causes

1. **Prisma Client Not Regenerated** - Most likely
2. **Wrong Database Connection** - App connecting to different DB
3. **Caching Issue** - Next.js caching old data
4. **Query Failing Silently** - Errors being swallowed

## Debugging Steps Added

### Code Changes
- ✅ Added console.log to show how many clients are fetched
- ✅ Added logging to show client names
- ✅ Added Prisma query logging (always on)
- ✅ Added DATABASE_URL logging (masked password)

## Commands to Run on Server

```bash
# 1. Check what DATABASE_URL the app is using
cd "/path/to/Laapak PO"
cat .env | grep DATABASE_URL

# 2. Verify it matches your database
mysql -u root -p0000 laapak_po -e "SELECT COUNT(*) as total FROM Client;"

# 3. Regenerate Prisma Client (CRITICAL!)
export DATABASE_URL="mysql://root:0000@localhost:3306/laapak_po"
npx prisma generate

# 4. Clear Next.js cache
rm -rf .next

# 5. Restart application
pm2 restart laapak-po

# 6. Watch logs in real-time
pm2 logs laapak-po --lines 0
```

## What to Look For in Logs

After restarting, you should see:
```
[Prisma] Initializing with DATABASE_URL: mysql://root:****@localhost:3306/laapak_po
[HomePage] Fetching clients from database...
[HomePage] Successfully fetched 9 clients
[HomePage] Client names: [list of 9 names]
```

If you see:
- `Successfully fetched 2 clients` - Query is working but only returning 2
- `Database error:` - There's a connection/query error
- No logs at all - Application not restarting or logs not being captured

## Quick Test

Test the database connection directly:
```bash
# Test Prisma can connect
npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM Client;"

# Test with Prisma Studio (visual interface)
npx prisma studio
# This will open a browser - check if you see all 9 clients
```

## If Prisma Studio Shows All 9 Clients

Then the issue is:
- Next.js caching
- Application not restarted properly
- Build cache issue

Solution:
```bash
rm -rf .next
pm2 stop laapak-po
pm2 start laapak-po
# OR rebuild
npm run build
pm2 restart laapak-po
```

## If Prisma Studio Also Shows Only 2 Clients

Then the issue is:
- Wrong database connection
- Different database being used
- Prisma Client pointing to wrong DB

Solution:
1. Check `.env` file has correct DATABASE_URL
2. Verify database name matches
3. Check if there are multiple databases


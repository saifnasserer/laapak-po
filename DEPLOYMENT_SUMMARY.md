# Deployment Summary: Local vs Remote Setup

## 📋 What We Did Locally

### 1. **Fixed Prisma Schema**
- ✅ Added `onDelete: Cascade` to all foreign key relations:
  - `PurchaseOffer` → `Client` (cascade when Client deleted)
  - `LineItem` → `PurchaseOffer` (cascade when PurchaseOffer deleted)
  - `POView` → `PurchaseOffer` (cascade when PurchaseOffer deleted)

### 2. **Created Local Environment File**
- ✅ Created `.env.local` with:
  ```bash
  DATABASE_URL="mysql://root:default@localhost:3306/laapak_po"
  NODE_ENV="development"
  ```

### 3. **Fixed MySQL Authentication**
- ✅ Created SQL script to change root authentication from `auth_socket` to `mysql_native_password`
- ✅ Updated `.env.local` with correct password: `default`

### 4. **Simplified DELETE Route**
- ✅ Removed manual deletion of related records (cascade handles it now)
- ✅ Updated: `src/app/api/purchase-offers/[id]/route.ts`

### 5. **Generated Prisma Client**
- ✅ Ran `npx prisma generate` to update Prisma Client

---

## 🚀 Commands to Run on Remote Server

### Step 1: Fix MySQL Authentication (if needed)

**Check if root authentication is already fixed:**
```bash
mysql -u root -p0000 -e "SELECT 1;" 2>&1
```

**If it fails, fix it:**
```bash
sudo mysql << 'EOF'
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '0000';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;
EOF
```

**Or use the SQL file:**
```bash
# On server, create the fix file
cat > /tmp/fix-mysql.sql << 'EOF'
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '0000';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EOF

# Run it
sudo mysql < /tmp/fix-mysql.sql
```

### Step 2: Sync Prisma Schema with Database

**Navigate to project directory:**
```bash
cd "/path/to/Laapak PO"  # Replace with your actual path
```

**Set environment variable (or ensure .env file exists):**
```bash
export DATABASE_URL="mysql://root:0000@localhost:3306/laapak_po"
```

**Or verify your `.env` file has:**
```bash
DATABASE_URL="mysql://root:0000@localhost:3306/laapak_po"
NODE_ENV="production"
NEXT_PUBLIC_BASE_URL="http://82.112.253.29:3002"
PORT=3002
```

**Generate Prisma Client:**
```bash
npx prisma generate
```

**Push schema to database (this adds cascade deletes and fixes constraints):**
```bash
npx prisma db push --accept-data-loss
```

### Step 3: Verify Database Schema

**Check that tables exist and have correct structure:**
```bash
mysql -u root -p0000 laapak_po -e "SHOW TABLES;"
mysql -u root -p0000 laapak_po -e "DESCRIBE PurchaseOffer;"
mysql -u root -p0000 laapak_po -e "SHOW CREATE TABLE PurchaseOffer\G" | grep -i "foreign\|cascade"
```

### Step 4: Restart Application

**If using PM2:**
```bash
pm2 restart laapak-po
# or
pm2 restart all
```

**If running directly:**
```bash
# Stop current process (Ctrl+C or kill)
# Then restart
npm run start:prod
```

### Step 5: Test the Application

1. **Test creating a client** - should work without errors
2. **Test creating a Purchase Offer** - should work without errors
3. **Test deleting a Purchase Offer** - should cascade delete LineItems and POViews

---

## 📝 Quick Reference: All Commands in One Block

```bash
# 1. Fix MySQL (if needed)
sudo mysql << 'EOF'
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '0000';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;
EOF

# 2. Navigate to project
cd "/path/to/Laapak PO"

# 3. Ensure .env file exists with DATABASE_URL
# (You already have this based on your earlier message)

# 4. Generate and sync Prisma
npx prisma generate
npx prisma db push --accept-data-loss

# 5. Restart application
pm2 restart laapak-po
# OR
npm run start:prod
```

---

## 🔍 Verification Checklist

After running the commands, verify:

- [ ] MySQL connection works: `mysql -u root -p0000 -e "SELECT 1;"`
- [ ] Prisma Client generated successfully
- [ ] Database schema synced (no errors from `prisma db push`)
- [ ] Application restarted successfully
- [ ] Can create new clients via UI
- [ ] Can create new Purchase Offers via UI
- [ ] Can delete Purchase Offers (cascade deletes work)

---

## 🐛 Troubleshooting

### If `prisma db push` fails:
- Check database connection: `mysql -u root -p0000 -e "USE laapak_po; SELECT 1;"`
- Check if tables exist: `mysql -u root -p0000 laapak_po -e "SHOW TABLES;"`
- Review error messages carefully

### If application still can't connect:
- Verify `.env` file has correct `DATABASE_URL`
- Check MySQL is running: `sudo systemctl status mysql`
- Check application logs: `pm2 logs laapak-po`

### If cascade deletes don't work:
- Verify foreign keys exist: Run the diagnostic SQL from `check-database-schema.sql`
- Re-run `npx prisma db push --accept-data-loss`

---

## 📁 Files Changed Locally

1. `prisma/schema.prisma` - Added cascade deletes
2. `src/app/api/purchase-offers/[id]/route.ts` - Simplified DELETE route
3. `.env.local` - Created for local development
4. `.gitignore` - Already includes `.env*.local`

## 📁 Files to Sync to Remote

**Only these files need to be on the server:**
1. `prisma/schema.prisma` - Updated schema
2. `src/app/api/purchase-offers/[id]/route.ts` - Updated DELETE route
3. `.env` - Server environment (already exists with correct DATABASE_URL)

**Do NOT sync:**
- `.env.local` - This is local only
- `.next/` - Build cache
- `node_modules/` - Dependencies

---

## 🎯 Expected Outcome

After running these commands on the remote server:

✅ Database schema matches Prisma schema  
✅ Foreign key constraints are properly configured  
✅ Cascade deletes work automatically  
✅ New clients can be created  
✅ New Purchase Offers can be created  
✅ Purchase Offers can be deleted (with cascade)  
✅ No more foreign key constraint errors  

---

## 📞 Key Differences: Local vs Remote

| Item | Local | Remote |
|------|-------|--------|
| **Environment File** | `.env.local` | `.env` |
| **Database Password** | `default` | `0000` |
| **NODE_ENV** | `development` | `production` |
| **Port** | 3000 (default) | 3002 |
| **Process Manager** | Direct `npm run dev` | PM2 |
| **Base URL** | `http://localhost:3000` | `http://82.112.253.29:3002` |

---

**Last Updated:** Based on current session fixes


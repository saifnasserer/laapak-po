# 🚀 Quick Remote Deployment Commands

## Essential Commands to Run on Server

### Option 1: Automated Script (Easiest)
```bash
# 1. Copy REMOTE_DEPLOY_COMMANDS.sh to your server
# 2. Update PROJECT_PATH in the script
# 3. Run it:
chmod +x REMOTE_DEPLOY_COMMANDS.sh
./REMOTE_DEPLOY_COMMANDS.sh
```

### Option 2: Manual Commands (Step by Step)

#### 1. Fix MySQL Authentication (if needed)
```bash
sudo mysql << 'EOF'
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '0000';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;
EOF
```

#### 2. Navigate to Project & Sync Database
```bash
cd "/path/to/Laapak PO"  # Update path
export DATABASE_URL="mysql://root:0000@localhost:3306/laapak_po"
npx prisma generate
npx prisma db push --accept-data-loss
```

#### 3. Restart Application
```bash
pm2 restart laapak-po
# OR if not using PM2:
npm run start:prod
```

---

## ✅ What Changed Locally

1. **Prisma Schema** - Added cascade deletes to foreign keys
2. **DELETE Route** - Simplified (removed manual deletions)
3. **Local .env.local** - Created for development

## 📤 What to Sync to Server

1. `prisma/schema.prisma` - Updated schema
2. `src/app/api/purchase-offers/[id]/route.ts` - Updated DELETE route

## 🎯 Expected Result

After running commands:
- ✅ Database schema matches Prisma
- ✅ Cascade deletes work
- ✅ Can create clients & POs
- ✅ No foreign key errors

---

**Full details:** See `DEPLOYMENT_SUMMARY.md`


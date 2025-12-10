#!/bin/bash

# Complete fix - Run this on your server

set -e

echo "🚀 Complete Fix for Client Display Issue"
echo "=========================================="
echo ""

# Step 1: Verify we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project directory"
    echo "Please cd to the laapak-po folder first"
    exit 1
fi

# Step 2: Check .env file
echo "📋 Step 1: Checking .env file..."
if [ -f .env ]; then
    echo "✅ .env file exists"
    if grep -q "DATABASE_URL" .env; then
        echo "✅ DATABASE_URL found in .env"
        grep DATABASE_URL .env | sed 's/:0000@/:****@/g'
    else
        echo "❌ DATABASE_URL not in .env!"
        exit 1
    fi
else
    echo "❌ .env file not found!"
    exit 1
fi
echo ""

# Step 3: Pull latest code (if using git)
echo "📥 Step 2: Checking for code updates..."
if [ -d .git ]; then
    echo "   Checking git status..."
    git status --short | head -5 || true
    echo "   (Make sure to commit and push code changes from local first)"
fi
echo ""

# Step 4: Load environment
echo "📋 Step 3: Loading environment..."
export $(cat .env | grep -v '^#' | xargs)
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set!"
    exit 1
fi
echo "✅ Environment loaded"
echo ""

# Step 5: Regenerate Prisma Client
echo "📦 Step 4: Regenerating Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi
echo "✅ Prisma Client regenerated"
echo ""

# Step 6: Clear Next.js cache and rebuild
echo "🧹 Step 5: Clearing Next.js cache..."
rm -rf .next
echo "✅ Cache cleared"
echo ""

echo "🔨 Step 6: Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo "✅ Build complete"
echo ""

# Step 7: Test database connection
echo "🔍 Step 7: Testing database connection..."
CLIENT_COUNT=$(mysql -u root -p0000 laapak_po -se "SELECT COUNT(*) FROM Client;" 2>/dev/null)
echo "   Database has $CLIENT_COUNT clients"
echo ""

# Step 8: Restart application
echo "🔄 Step 8: Restarting application..."
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "laapak-po"; then
        echo "   Stopping application..."
        pm2 stop laapak-po
        sleep 2
        echo "   Starting application..."
        pm2 start laapak-po
        pm2 save
        echo "✅ Application restarted"
    else
        echo "⚠️  Application not found in PM2"
        echo "   Starting with: pm2 start npm --name laapak-po -- run start:prod"
        pm2 start npm --name laapak-po -- run start:prod
        pm2 save
    fi
    
    echo ""
    echo "⏳ Waiting 5 seconds for application to start..."
    sleep 5
    echo ""
    echo "📊 Recent logs (last 50 lines):"
    echo "----------------------------------------"
    pm2 logs laapak-po --lines 50 --nostream | tail -30
    echo "----------------------------------------"
else
    echo "⚠️  PM2 not found. Please restart manually:"
    echo "   npm run start:prod"
fi
echo ""

echo "✨ Fix Complete!"
echo ""
echo "🔍 What to check:"
echo "   1. Visit your website homepage"
echo "   2. Check PM2 logs: pm2 logs laapak-po --lines 0"
echo "   3. Look for these messages in logs:"
echo "      - [Prisma] Initializing with DATABASE_URL"
echo "      - [HomePage] Fetching clients from database..."
echo "      - [HomePage] Successfully fetched X clients"
echo ""
echo "📊 If you see 'Successfully fetched 2 clients' in logs,"
echo "   the query is working but only returning 2 records."
echo "   If you see 'Successfully fetched 9 clients',"
echo "   but only 2 show on the page, it's a rendering/cache issue."
echo ""


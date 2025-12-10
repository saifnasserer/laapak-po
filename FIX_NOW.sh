#!/bin/bash

# Complete fix for client display issue

echo "🔧 Fixing client display issue..."
echo ""

# Step 1: Verify .env
echo "📋 Step 1: Verifying .env file..."
if [ -f .env ]; then
    echo "✅ .env file exists"
    grep DATABASE_URL .env | sed 's/:0000@/:****@/g'
else
    echo "❌ .env file not found!"
    exit 1
fi
echo ""

# Step 2: Regenerate Prisma Client (CRITICAL!)
echo "📦 Step 2: Regenerating Prisma Client..."
export DATABASE_URL="mysql://root:0000@localhost:3306/laapak_po"
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi
echo "✅ Prisma Client regenerated"
echo ""

# Step 3: Clear Next.js cache and rebuild
echo "🧹 Step 3: Clearing Next.js cache..."
rm -rf .next
echo "✅ Cache cleared"
echo ""

echo "🔨 Step 4: Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo "✅ Build complete"
echo ""

# Step 5: Test Prisma connection
echo "🔍 Step 5: Testing Prisma connection..."
npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM Client;" 2>&1 | head -10
echo ""

# Step 6: Restart application
echo "🔄 Step 6: Restarting application..."
if command -v pm2 &> /dev/null; then
    pm2 restart laapak-po
    echo "✅ Application restarted"
    echo ""
    echo "⏳ Waiting 3 seconds for app to start..."
    sleep 3
    echo ""
    echo "📊 Recent logs (look for [HomePage] messages):"
    pm2 logs laapak-po --lines 50 --nostream | grep -E "\[HomePage\]|\[Prisma\]|Database|error|Error" || echo "No matching logs found"
else
    echo "⚠️  PM2 not found. Please restart manually"
fi
echo ""

echo "✨ Fix complete!"
echo ""
echo "🔍 Next steps:"
echo "   1. Visit the homepage in your browser"
echo "   2. Check PM2 logs: pm2 logs laapak-po --lines 0"
echo "   3. Look for: [HomePage] Successfully fetched X clients"
echo ""


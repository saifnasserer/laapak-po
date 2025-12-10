#!/bin/bash

# Diagnostic script to find why only 2 clients are showing

echo "🔍 Diagnosing Client Display Issue..."
echo ""

# Step 1: Check database directly
echo "📋 Step 1: Checking database directly..."
CLIENT_COUNT=$(mysql -u root -p0000 laapak_po -se "SELECT COUNT(*) FROM Client;" 2>/dev/null)
echo "   Database has $CLIENT_COUNT clients"
echo ""

# Step 2: Check .env file
echo "📋 Step 2: Checking .env file..."
if [ -f .env ]; then
    echo "   .env file exists"
    DB_URL=$(grep DATABASE_URL .env | cut -d'=' -f2 | tr -d '"')
    echo "   DATABASE_URL: $DB_URL"
else
    echo "   ❌ .env file not found!"
fi
echo ""

# Step 3: Test Prisma connection
echo "📋 Step 3: Testing Prisma connection..."
export DATABASE_URL="mysql://root:0000@localhost:3306/laapak_po"
npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM Client;" 2>&1 | grep -A 5 "count" || echo "   ⚠️  Could not execute query"
echo ""

# Step 4: Check Prisma Client
echo "📋 Step 4: Checking if Prisma Client needs regeneration..."
if [ ! -d "node_modules/@prisma/client" ]; then
    echo "   ❌ Prisma Client not found! Regenerating..."
    npx prisma generate
else
    echo "   ✅ Prisma Client exists"
    echo "   (Still recommend regenerating: npx prisma generate)"
fi
echo ""

# Step 5: Check PM2 status
echo "📋 Step 5: Checking PM2 status..."
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "laapak-po"; then
        echo "   ✅ Application is running"
        echo "   Restarting to clear cache..."
        pm2 restart laapak-po
        echo "   ✅ Application restarted"
        echo ""
        echo "   📊 Recent logs:"
        pm2 logs laapak-po --lines 20 --nostream
    else
        echo "   ⚠️  Application not found in PM2"
    fi
else
    echo "   ⚠️  PM2 not found"
fi
echo ""

# Step 6: Recommendations
echo "📋 Recommendations:"
echo "   1. Regenerate Prisma Client: npx prisma generate"
echo "   2. Clear Next.js cache: rm -rf .next"
echo "   3. Restart application: pm2 restart laapak-po"
echo "   4. Watch logs: pm2 logs laapak-po --lines 0"
echo ""
echo "✨ Diagnostic complete!"

